const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Erc20Transfer = sequelize.define('Erc20Transfer', {
        token_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
		transaction_hash: {
			type: DataTypes.STRING,
			allowNull: false,
			primaryKey: true
		},
		log_index: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true
		},
		block_number: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		transaction_index: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		from_address: {
			type: DataTypes.STRING,
			allowNull: true
		},
		to_address: {
			type: DataTypes.STRING,
			allowNull: true
		},
		value: {
			type: DataTypes.STRING,
			allowNull: true
		}
  	});

module.exports = Erc20Transfer;