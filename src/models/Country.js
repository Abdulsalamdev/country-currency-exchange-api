/*
Optional Sequelize model for future use. Current implementation uses raw MySQL queries.
*/
import { DataTypes } from 'sequelize';
export default (sequelize) => sequelize.define('Country', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(255), allowNull: false },
  name_lc: { type: DataTypes.STRING(255), allowNull: false },
  capital: { type: DataTypes.STRING(255) },
  region: { type: DataTypes.STRING(100) },
  population: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  currency_code: { type: DataTypes.STRING(10) },
  exchange_rate: { type: DataTypes.DOUBLE },
  estimated_gdp: { type: DataTypes.DOUBLE },
  flag_url: { type: DataTypes.STRING(1024) },
  last_refreshed_at: { type: DataTypes.DATE }
}, { timestamps: false });
