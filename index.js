const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
const app = express()
const port = 5000;
const cors = require("cors")
const carData = require("./datas/carData.json");
const services = require("./datas/servicesData.json");
require('dotenv').config()
// console.log(carData)

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ra0tvnn.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();

    const carsCullection = client.db("carDoctorBD").collection("allCarsData");
    const carsInfoCullection = client.db("carDoctorBD").collection("carsInfoData");
    const carsBookingCullection = client.db("carDoctorBD").collection("carsBookingData");

    app.get("/services", async (req, res) => {
      const query = {}
      const result = await carsCullection.find(query).toArray();
      res.send(result)
    })
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const options = {
        projection: { title: 1, img: 1, service_id: 1, price: 1 },
      };
      const result = await carsCullection.findOne(query, options)
      res.send(result)
    })

    app.get("/carData", async (req, res) => {
      const query = {}
      const result = await carsInfoCullection.find(query).toArray();
      res.send(result)
    })

    app.post("/carData", async (req, res) => {
      const bookingData = req.body;
      const result = await carsBookingCullection.insertOne(bookingData);
      res.send(result)
    })

    app.get("/booking", async (req, res) => {
      const email = req.query.email;
      let query = {}
      if (email) {
        query = { email: email }
      }
      const result = await carsBookingCullection.find(query).toArray();
      res.send(result)
    })
    app.put("/booking/:id", async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          name: updatedData.name,
          date: updatedData.date,
          email: updatedData.email,
          serviceType: updatedData.serviceType,
          message: updatedData.message,
          serviceId: updatedData.serviceId,
          price: updatedData.price,
          img: updatedData.img
        }
      }
      const result = await carsBookingCullection.updateOne(filter, updatedDoc, options);
      res.send(result)


    })

    app.get("/booking/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id)
      const query = { _id: new ObjectId(id) }
      const result = await carsBookingCullection.findOne(query)
      res.send(result)
    })
    app.patch("/booking/:id", async (req, res) => {
      const id = req.params.id;
      const updateData = req.body;

      // console.log(updateData)
      if (updateData.status === "reoveConfirm") {
        const query = { _id: new ObjectId(id) };
        const updateValue = {
          $unset: {
            status: 1,
          }
        }
        const result = await carsBookingCullection.updateOne(query, updateValue)
        res.send(result)
        return
      }

      const query = { _id: new ObjectId(id) };
      const updateValue = {
        $set: {
          status: updateData.status,
        }
      }
      const result = await carsBookingCullection.updateOne(query, updateValue)
      res.send(result)
    })

    app.delete("/booking/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await carsBookingCullection.deleteOne(query)
      res.send(result)
    })








    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Hello World!')
})




app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})