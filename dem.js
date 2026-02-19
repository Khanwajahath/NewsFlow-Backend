
import  mongoose from 'mongoose';
const uri = "mongodb+srv://wajjakhan1526_db_user:lxXo6llnWzPbbXuv@cluster0.g6kycvc.mongodb.net/?appName=Cluster0";
import dns from 'dns'
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

async function run() {
  try {
    // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
    await mongoose.connect(uri, clientOptions);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await mongoose.disconnect();
  }
}
run().catch(console.dir);
