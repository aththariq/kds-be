"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimulationUpdate = exports.SimulationExport = exports.SimulationHistory = exports.Bacterium = exports.Simulation = void 0;
// Export all MongoDB models for the bacteria simulation project
var Simulation_1 = require("./Simulation");
Object.defineProperty(exports, "Simulation", { enumerable: true, get: function () { return __importDefault(Simulation_1).default; } });
var Bacterium_1 = require("./Bacterium");
Object.defineProperty(exports, "Bacterium", { enumerable: true, get: function () { return __importDefault(Bacterium_1).default; } });
var SimulationHistory_1 = require("./SimulationHistory");
Object.defineProperty(exports, "SimulationHistory", { enumerable: true, get: function () { return __importDefault(SimulationHistory_1).default; } });
var SimulationExport_1 = require("./SimulationExport");
Object.defineProperty(exports, "SimulationExport", { enumerable: true, get: function () { return __importDefault(SimulationExport_1).default; } });
var SimulationUpdate_1 = require("./SimulationUpdate");
Object.defineProperty(exports, "SimulationUpdate", { enumerable: true, get: function () { return __importDefault(SimulationUpdate_1).default; } });
