db.createUser(
    {
        user: "deneme-root",
        pwd: "xhjko97fj",
        roles: [
            {
                role: "readWrite",
                db: "deneme-db"
            }
        ]
    }
);