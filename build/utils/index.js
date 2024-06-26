"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractPublicID = void 0;
function extractPublicID(url) {
    return `streamNow/${url
        .split("/")
        .splice(url.split("/").length - 2)[1]
        .split(".")[0]}`;
}
exports.extractPublicID = extractPublicID;
