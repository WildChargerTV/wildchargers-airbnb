// backend/psql-setup-script.js
const { sequelize } = require('./db/models');

sequelize.showAllSchemas({ logging: false }).then(async (data) => {
  if(data.includes(process.env.SCHEMA)) {
    console.log("checkpoint: schema found, dropping")
    await sequelize.dropSchema(process.env.SCHEMA);
  }
  
})

sequelize.showAllSchemas({ logging: false }).then(async (data) => {
  if (!data.includes(process.env.SCHEMA)) {
    console.log("checkpoint: schema not found, creating")
    await sequelize.createSchema(process.env.SCHEMA);
  }
});