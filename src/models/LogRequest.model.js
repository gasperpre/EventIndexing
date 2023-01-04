const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const LogRequest = sequelize.define('LogRequest', {
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
            autoIncrement: true,
			primaryKey: true,
		},
		url: {
			type: DataTypes.STRING,
			allowNull: false
		},
		method: {
			type: DataTypes.STRING,
			allowNull: false
		},
		api_key: {
			type: DataTypes.STRING,
			allowNull: false
		}
  	});

module.exports = LogRequest;