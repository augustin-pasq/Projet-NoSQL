/**
 * R4.03 NoSQL
 * Projet
 *
 * PASQUIER Augustin
 * LE NY Liam
 * 05/05/2023
 */

/* https://github.com/Keyang/node-csvtojson */
const csv = require("csvtojson");
const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017/";
const client = new MongoClient(uri);

async function run() {
    try {
        const data = await csv().fromFile("./Voitures.csv");
        for(let i in data) {
            let moteur = { carburant: "", capacite_moteur: "" }
            moteur.carburant = data[i].carburant;
            moteur.capacite_moteur = Number(data[i].capacite_moteur);
            delete data[i].carburant;
            delete data[i].capacite_moteur;
            data[i].moteur = moteur

            data[i].kilometrage = parseInt(data[i].kilometrage)
            data[i].annee_production = parseInt(data[i].annee_production)
            data[i].prix = parseInt(data[i].prix)
            data[i].sous_garantie = data[i].sous_garantie == 'true'
            data[i].date_publication = new Date(data[i].date_publication)
        }

        const database = client.db("Concessionnaire")
        const voitures = await database.createCollection("voitures", {
            validator: {
                $jsonSchema: {
                    bsonType: "object",
                    required: [
                        "marque",
                        "modele",
                        "boite_vitesse",
                        "annee_production",
                        "couleur",
                        "kilometrage",
                        "moteur",
                        "categorie",
                        "sous_garantie",
                        "etat",
                        "transmission",
                        "prix",
                        "date_publication",
                    ],
                    properties: {
                        marque: { bsonType: "string" },
                        modele: { bsonType: "string" },
                        boite_vitesse: {
                            bsonType: "string",
                            enum: ["Automatique", "Manuelle"],
                        },
                        annee_production: { bsonType: "int" },
                        couleur: {
                            bsonType: "string",
                            enum: [
                                "Argent",
                                "Blanc",
                                "Bleu",
                                "Gris",
                                "Jaune",
                                "Marron",
                                "Noir",
                                "Orange",
                                "Rouge",
                                "Vert",
                                "Violet",
                                "Autre",
                            ],
                        },
                        moteur: {
                            bsonType: "object",
                            required: ["carburant", "capacite_moteur"],
                            properties: {
                                carburant: {
                                    bsonType: "string",
                                    enum: ["Essence", "Diesel", "Électrique", "GPL", "Hybride"],
                                },
                                capacite_moteur: {
                                    bsonType: ["int", "double"],
                                    minimum: 0.2,
                                    maximum: 8.0,
                                },
                            },
                        },
                        kilometrage: { bsonType: "int" },
                        categorie: { bsonType: "string" },
                        sous_garantie: { bsonType: "bool" },
                        etat: {
                            bsonType: "string",
                            enum: ["Urgence", "Nouvelle", "Vendue"],
                        },
                        transmission: {
                            bsonType: "string",
                            enum: ["Propulsion", "Traction", "4 roues motrices"],
                        },
                        prix: { bsonType: "int", minimum: 1 },
                        date_publication: { bsonType: "date" },
                    },
                },
            },
        });
        console.log("'voitures' collection created successfully")

        let result
        result = await voitures.insertMany(data)
        console.log(`${result.insertedCount} documents were inserted\n`)

    } finally {
        //await db.dropDatabase()
        await client.close()
    }
}

run().catch(console.dir)