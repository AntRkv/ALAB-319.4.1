import express from "express";
const router = express.Router();
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";

// Route to get stats of all students
router.get("/grades/stats", async (req, res) => {
  try {
    const collection = db.collection("grades");

    const result = await collection
      .aggregate([
        {
          // Calculate the average score for each student
          $addFields: {
            weightedAverage: {
              $avg: "$scores.score"
            }
          }
        },
        {
          $group: {
            _id: null,
            totalStudents: { $sum: 1 },
            studentsAbove70: {
              $sum: {
                $cond: [{ $gt: ["$weightedAverage", 70] }, 1, 0]
              }
            }
          }
        },
        {
          $project: {
            totalStudents: 1,
            studentsAbove70: 1,
            percentageAbove70: {
              $multiply: [
                { $divide: ["$studentsAbove70", "$totalStudents"] },
                100
              ]
            }
          }
        }
      ])
      .toArray();

    res.status(200).send(result[0] || {});
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Route to get stats by class ID
router.get("/grades/stats/:id", async (req, res) => {
  try {
    const collection = db.collection("grades");

    const result = await collection
      .aggregate([
        {
          $match: { class_id: parseInt(req.params.id, 10) }
        },
        {
          // Calculate the average score for each student
          $addFields: {
            weightedAverage: {
              $avg: "$scores.score"
            }
          }
        },
        {
          $group: {
            _id: null,
            totalStudents: { $sum: 1 },
            studentsAbove70: {
              $sum: {
                $cond: [{ $gt: ["$weightedAverage", 70] }, 1, 0]
              }
            }
          }
        },
        {
          $project: {
            totalStudents: 1,
            studentsAbove70: 1,
            percentageAbove70: {
              $multiply: [
                { $divide: ["$studentsAbove70", "$totalStudents"] },
                100
              ]
            }
          }
        }
      ])
      .toArray();

    res.status(200).send(result[0] || {});
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get list of students
router.get("/", async (req, res) => {
  try {
    const collection = await db.collection("grades");
    const result = await collection.find({}).limit(10).toArray();
    res.status(200).send(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get a student by ID
router.get("/:id", async (req, res) => {
  try {
    const collection = await db.collection("grades");
    const query = { _id: new ObjectId(req.params.id) };
    const result = await collection.findOne(query);

    if (!result) {
      return res.status(404).json({ msg: "Student not found" });
    }

    res.status(200).send(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Create a new student
router.post("/", async (req, res) => {
  try {
    const collection = await db.collection("grades");
    const result = await collection.insertOne(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Update a student by ID
router.patch("/:id", async (req, res) => {
  try {
    const collection = await db.collection("grades");
    const query = { _id: new ObjectId(req.params.id) };
    const result = await collection.updateOne(query, { $set: req.body });

    if (result.modifiedCount === 0) {
      return res.status(404).json({ msg: "Student not found" });
    }

    res.status(200).json({ msg: "Student successfully updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Delete a student by ID
router.delete("/:id", async (req, res) => {
  try {
    const collection = await db.collection("grades");
    const query = { _id: new ObjectId(req.params.id) };
    const result = await collection.deleteOne(query);

    if (result.deletedCount === 0) {
      return res.status(404).json({ msg: "Student not found" });
    }

    res.status(200).json({ msg: "Student successfully deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
