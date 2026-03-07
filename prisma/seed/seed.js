"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var currentUser, authUser, thirdUser, lcpUser;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Clearing existing data...');
                    return [4 /*yield*/, prisma.activityComment.deleteMany()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, prisma.activity.deleteMany()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, prisma.proposal.deleteMany()];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, prisma.notification.deleteMany()];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, prisma.contact.deleteMany()];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, prisma.company.deleteMany()];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, prisma.user.deleteMany()];
                case 7:
                    _a.sent();
                    console.log('Seeding mock users...');
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                id: '1',
                                name: 'Ahmet Yılmaz',
                                email: 'ahmet@aiesec.org',
                                role: 'LCVP',
                                avatar: 'https://i.pravatar.cc/150?u=1'
                            }
                        })
                        // Managers
                    ];
                case 8:
                    currentUser = _a.sent();
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                id: '2',
                                name: 'Ayşe Demir',
                                email: 'ayse@aiesec.org',
                                role: 'TeamLeader', // or Menajer depending on how the frontend tracks
                                avatar: 'https://i.pravatar.cc/150?u=2'
                            }
                        })];
                case 9:
                    authUser = _a.sent();
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                id: '3',
                                name: 'Mehmet Kaya',
                                email: 'mehmet@aiesec.org',
                                role: 'TeamMember',
                                avatar: 'https://i.pravatar.cc/150?u=3'
                            }
                        })];
                case 10:
                    thirdUser = _a.sent();
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                id: '4',
                                name: 'Canan Öz',
                                email: 'canan@aiesec.org',
                                role: 'LCP',
                                avatar: 'https://i.pravatar.cc/150?u=4'
                            }
                        })];
                case 11:
                    lcpUser = _a.sent();
                    console.log('Seeding mock companies...');
                    // Create test Companies
                    return [4 /*yield*/, prisma.company.create({
                            data: {
                                id: '1',
                                name: 'TechFlow Solutions',
                                category: 'Yazılım',
                                location: 'İstanbul, Türkiye',
                                phone: '+90 555 123 4567',
                                email: 'info@techflow.com',
                                website: 'www.techflow.com',
                                status: 'aktif',
                                activeProposals: 2,
                                contactCount: 3,
                                managers: {
                                    connect: [{ id: currentUser.id }, { id: authUser.id }] // Ahmet and Ayşe
                                }
                            }
                        })];
                case 12:
                    // Create test Companies
                    _a.sent();
                    return [4 /*yield*/, prisma.company.create({
                            data: {
                                id: '2',
                                name: 'Global Lojistik A.Ş.',
                                category: 'Lojistik',
                                location: 'Kocaeli, Türkiye',
                                phone: '+90 555 987 6543',
                                email: 'contact@globallojistik.com',
                                status: 'toplanti_planlandi',
                                activeProposals: 1,
                                contactCount: 2,
                                managers: {
                                    connect: [{ id: thirdUser.id }] // Mehmet
                                }
                            }
                        })];
                case 13:
                    _a.sent();
                    console.log('Seed completed successfully.');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error(e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
