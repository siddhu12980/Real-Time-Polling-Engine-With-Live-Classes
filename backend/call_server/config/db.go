package config

import (
	"live/prisma/db"
	"log"
)

func ConnectDB() (*db.PrismaClient, error) {

	client := db.NewClient()

	if err := client.Prisma.Connect(); err != nil {
		return nil, err
	}

	log.Println("Connected to the database")

	return client, nil
}
