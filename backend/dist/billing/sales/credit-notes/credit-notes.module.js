"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreditNotesModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const credit_notes_controller_1 = require("./credit-notes.controller");
const credit_notes_service_1 = require("./credit-notes.service");
const credit_note_schema_1 = require("../../../credit-notes/schemas/credit-note.schema");
const invoice_schema_1 = require("../schemas/invoice.schema");
let CreditNotesModule = class CreditNotesModule {
};
exports.CreditNotesModule = CreditNotesModule;
exports.CreditNotesModule = CreditNotesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: credit_note_schema_1.CreditNote.name, schema: credit_note_schema_1.CreditNoteSchema },
                { name: invoice_schema_1.Invoice.name, schema: invoice_schema_1.InvoiceSchema },
            ]),
        ],
        controllers: [credit_notes_controller_1.CreditNotesController],
        providers: [credit_notes_service_1.CreditNotesService],
        exports: [credit_notes_service_1.CreditNotesService],
    })
], CreditNotesModule);
//# sourceMappingURL=credit-notes.module.js.map