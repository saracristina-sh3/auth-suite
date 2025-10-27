import api from "./api";
import authService from "./auth.service";
import {userService} from "./user.service";
import {autarquiaService} from "./autarquia.service";
import {moduloService} from "./modulos.service";
import {autarquiaModuloService, type BulkUpdateModulo} from "./autarquia-modulo.service";

export {
    api,
    authService,
    userService,
    autarquiaService,
    moduloService,
    autarquiaModuloService
};      export type { BulkUpdateModulo };

