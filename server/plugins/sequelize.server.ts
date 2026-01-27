import { db } from "../database/db";
import { NitroApp } from "nitropack";

export default defineNitroPlugin((nitroApp: NitroApp) => {
    nitroApp.hooks.hook("request", (event) => {
        event.context.db = db;
    });
});