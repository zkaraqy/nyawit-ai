import type { Sequelize, Model } from 'sequelize'
import { Waitlist } from './Waitlist'

export {
  Waitlist
}

export function initModels(sequelize: Sequelize) {
  Waitlist.initModel(sequelize)

  return {
    Waitlist
  }
}