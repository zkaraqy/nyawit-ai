import {
    CreationOptional,
    DataTypes,
    InferCreationAttributes,
    InferAttributes,
    Model,
    Sequelize
} from 'sequelize'

export class Waitlist extends Model<
    InferAttributes<Waitlist>,
    InferCreationAttributes<Waitlist>
> {
    declare id: CreationOptional<number>
    declare email: string
    declare createdAt: CreationOptional<Date>
    declare updatedAt: CreationOptional<Date>

    static initModel(sequelize: Sequelize): typeof Waitlist {
        Waitlist.init({
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
                unique: true
            },
            email: {
                type: DataTypes.STRING(255),
                allowNull: false
            },
            createdAt: {
                type: DataTypes.DATE
            },
            updatedAt: {
                type: DataTypes.DATE
            }
        }, {
            sequelize,
            underscored: true,
            tableName: 'waitlists',
        })

        return Waitlist
    }
}