"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientContactSchema = exports.ClientContact = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let ClientContact = class ClientContact {
};
exports.ClientContact = ClientContact;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ClientContact.prototype, "firstName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ClientContact.prototype, "lastName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ClientContact.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ClientContact.prototype, "phone", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        enum: ['principal', 'commercial', 'comptable', 'technique', 'autre'],
        default: 'autre',
        required: true,
    }),
    __metadata("design:type", String)
], ClientContact.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], ClientContact.prototype, "isPrimary", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ClientContact.prototype, "position", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ClientContact.prototype, "notes", void 0);
exports.ClientContact = ClientContact = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], ClientContact);
exports.ClientContactSchema = mongoose_1.SchemaFactory.createForClass(ClientContact);
//# sourceMappingURL=client-contact.schema.js.map