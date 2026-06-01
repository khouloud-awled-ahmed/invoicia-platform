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
exports.MatchReconciliationDto = exports.ReconciliationTargetType = void 0;
const class_validator_1 = require("class-validator");
var ReconciliationTargetType;
(function (ReconciliationTargetType) {
    ReconciliationTargetType["INVOICE"] = "INVOICE";
    ReconciliationTargetType["EXPENSE"] = "EXPENSE";
    ReconciliationTargetType["PAYROLL"] = "PAYROLL";
    ReconciliationTargetType["TAX"] = "TAX";
})(ReconciliationTargetType || (exports.ReconciliationTargetType = ReconciliationTargetType = {}));
class MatchReconciliationDto {
}
exports.MatchReconciliationDto = MatchReconciliationDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], MatchReconciliationDto.prototype, "bankTransactionId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], MatchReconciliationDto.prototype, "targetId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(ReconciliationTargetType),
    __metadata("design:type", String)
], MatchReconciliationDto.prototype, "targetType", void 0);
//# sourceMappingURL=match-reconciliation.dto.js.map