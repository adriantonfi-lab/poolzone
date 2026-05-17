/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/predictions/route";
exports.ids = ["app/api/predictions/route"];
exports.modules = {

/***/ "(rsc)/./app/api/predictions/route.ts":
/*!**************************************!*\
  !*** ./app/api/predictions/route.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @supabase/supabase-js */ \"(rsc)/./node_modules/@supabase/supabase-js/dist/index.mjs\");\n\n\nasync function POST(req) {\n    try {\n        const body = await req.json();\n        const { userId, match_id, predicted_winner, predicted_home_score, predicted_away_score, predicted_scorers, predicted_first_half_goals, predicted_second_half_goals, predicted_penalties, late_fee } = body;\n        if (!userId || !match_id || !predicted_winner) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: 'Faltan datos'\n            }, {\n                status: 400\n            });\n        }\n        const supabase = (0,_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_1__.createClient)(\"https://zjlaabrqfjtvbtbvoaic.supabase.co\", process.env.SUPABASE_SERVICE_ROLE);\n        // Verificar que el partido no empezó (excepto entretiempo)\n        const { data: match } = await supabase.from('matches').select('match_date, status').eq('id', match_id).single();\n        if (!match) return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: 'Partido no encontrado'\n        }, {\n            status: 404\n        });\n        const now = Date.now();\n        const kickoff = new Date(match.match_date).getTime();\n        const minsPassed = (now - kickoff) / 60000;\n        // Bloqueado si el partido ya empezó y no es entretiempo\n        if (minsPassed > 0 && !(minsPassed >= 45 && minsPassed <= 65)) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: 'No se puede modificar — partido en curso'\n            }, {\n                status: 403\n            });\n        }\n        // Upsert predicción\n        const { error } = await supabase.from('predictions').upsert({\n            user_id: userId,\n            match_id,\n            predicted_winner,\n            predicted_home_score,\n            predicted_away_score,\n            predicted_scorers,\n            predicted_first_half_goals,\n            predicted_second_half_goals,\n            predicted_penalties,\n            late_fee,\n            filled_at: new Date().toISOString()\n        }, {\n            onConflict: 'user_id,match_id'\n        });\n        if (error) {\n            console.error('Prediction error:', error);\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: error.message\n            }, {\n                status: 500\n            });\n        }\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            success: true\n        });\n    } catch (err) {\n        console.error(err);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: 'Error interno'\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL3ByZWRpY3Rpb25zL3JvdXRlLnRzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUEwQztBQUNVO0FBRTdDLGVBQWVFLEtBQUtDLEdBQVk7SUFDckMsSUFBSTtRQUNGLE1BQU1DLE9BQU8sTUFBTUQsSUFBSUUsSUFBSTtRQUMzQixNQUFNLEVBQ0pDLE1BQU0sRUFBRUMsUUFBUSxFQUFFQyxnQkFBZ0IsRUFDbENDLG9CQUFvQixFQUFFQyxvQkFBb0IsRUFDMUNDLGlCQUFpQixFQUFFQywwQkFBMEIsRUFDN0NDLDJCQUEyQixFQUFFQyxtQkFBbUIsRUFDaERDLFFBQVEsRUFDVCxHQUFHWDtRQUVKLElBQUksQ0FBQ0UsVUFBVSxDQUFDQyxZQUFZLENBQUNDLGtCQUFrQjtZQUM3QyxPQUFPUixxREFBWUEsQ0FBQ0ssSUFBSSxDQUFDO2dCQUFFVyxPQUFPO1lBQWUsR0FBRztnQkFBRUMsUUFBUTtZQUFJO1FBQ3BFO1FBRUEsTUFBTUMsV0FBV2pCLG1FQUFZQSxDQUMzQmtCLDBDQUFvQyxFQUNwQ0EsUUFBUUMsR0FBRyxDQUFDRSxxQkFBcUI7UUFHbkMsMkRBQTJEO1FBQzNELE1BQU0sRUFBRUMsTUFBTUMsS0FBSyxFQUFFLEdBQUcsTUFBTU4sU0FDM0JPLElBQUksQ0FBQyxXQUNMQyxNQUFNLENBQUMsc0JBQ1BDLEVBQUUsQ0FBQyxNQUFNcEIsVUFDVHFCLE1BQU07UUFFVCxJQUFJLENBQUNKLE9BQU8sT0FBT3hCLHFEQUFZQSxDQUFDSyxJQUFJLENBQUM7WUFBRVcsT0FBTztRQUF3QixHQUFHO1lBQUVDLFFBQVE7UUFBSTtRQUV2RixNQUFNWSxNQUFNQyxLQUFLRCxHQUFHO1FBQ3BCLE1BQU1FLFVBQVUsSUFBSUQsS0FBS04sTUFBTVEsVUFBVSxFQUFFQyxPQUFPO1FBQ2xELE1BQU1DLGFBQWEsQ0FBQ0wsTUFBTUUsT0FBTSxJQUFLO1FBRXJDLHdEQUF3RDtRQUN4RCxJQUFJRyxhQUFhLEtBQUssQ0FBRUEsQ0FBQUEsY0FBYyxNQUFNQSxjQUFjLEVBQUMsR0FBSTtZQUM3RCxPQUFPbEMscURBQVlBLENBQUNLLElBQUksQ0FBQztnQkFBRVcsT0FBTztZQUEyQyxHQUFHO2dCQUFFQyxRQUFRO1lBQUk7UUFDaEc7UUFFQSxvQkFBb0I7UUFDcEIsTUFBTSxFQUFFRCxLQUFLLEVBQUUsR0FBRyxNQUFNRSxTQUNyQk8sSUFBSSxDQUFDLGVBQ0xVLE1BQU0sQ0FBQztZQUNOQyxTQUFTOUI7WUFDVEM7WUFDQUM7WUFDQUM7WUFDQUM7WUFDQUM7WUFDQUM7WUFDQUM7WUFDQUM7WUFDQUM7WUFDQXNCLFdBQVcsSUFBSVAsT0FBT1EsV0FBVztRQUNuQyxHQUFHO1lBQUVDLFlBQVk7UUFBbUI7UUFFdEMsSUFBSXZCLE9BQU87WUFDVHdCLFFBQVF4QixLQUFLLENBQUMscUJBQXFCQTtZQUNuQyxPQUFPaEIscURBQVlBLENBQUNLLElBQUksQ0FBQztnQkFBRVcsT0FBT0EsTUFBTXlCLE9BQU87WUFBQyxHQUFHO2dCQUFFeEIsUUFBUTtZQUFJO1FBQ25FO1FBRUEsT0FBT2pCLHFEQUFZQSxDQUFDSyxJQUFJLENBQUM7WUFBRXFDLFNBQVM7UUFBSztJQUUzQyxFQUFFLE9BQU9DLEtBQUs7UUFDWkgsUUFBUXhCLEtBQUssQ0FBQzJCO1FBQ2QsT0FBTzNDLHFEQUFZQSxDQUFDSyxJQUFJLENBQUM7WUFBRVcsT0FBTztRQUFnQixHQUFHO1lBQUVDLFFBQVE7UUFBSTtJQUNyRTtBQUNGIiwic291cmNlcyI6WyIvVXNlcnMvYWRyaWFuZnQvRGVza3RvcC9jaGUtYmFjYW5vLWZpbmFsL2FwcC9hcGkvcHJlZGljdGlvbnMvcm91dGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmV4dFJlc3BvbnNlIH0gZnJvbSAnbmV4dC9zZXJ2ZXInXG5pbXBvcnQgeyBjcmVhdGVDbGllbnQgfSBmcm9tICdAc3VwYWJhc2Uvc3VwYWJhc2UtanMnXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBQT1NUKHJlcTogUmVxdWVzdCkge1xuICB0cnkge1xuICAgIGNvbnN0IGJvZHkgPSBhd2FpdCByZXEuanNvbigpXG4gICAgY29uc3Qge1xuICAgICAgdXNlcklkLCBtYXRjaF9pZCwgcHJlZGljdGVkX3dpbm5lcixcbiAgICAgIHByZWRpY3RlZF9ob21lX3Njb3JlLCBwcmVkaWN0ZWRfYXdheV9zY29yZSxcbiAgICAgIHByZWRpY3RlZF9zY29yZXJzLCBwcmVkaWN0ZWRfZmlyc3RfaGFsZl9nb2FscyxcbiAgICAgIHByZWRpY3RlZF9zZWNvbmRfaGFsZl9nb2FscywgcHJlZGljdGVkX3BlbmFsdGllcyxcbiAgICAgIGxhdGVfZmVlXG4gICAgfSA9IGJvZHlcblxuICAgIGlmICghdXNlcklkIHx8ICFtYXRjaF9pZCB8fCAhcHJlZGljdGVkX3dpbm5lcikge1xuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgZXJyb3I6ICdGYWx0YW4gZGF0b3MnIH0sIHsgc3RhdHVzOiA0MDAgfSlcbiAgICB9XG5cbiAgICBjb25zdCBzdXBhYmFzZSA9IGNyZWF0ZUNsaWVudChcbiAgICAgIHByb2Nlc3MuZW52Lk5FWFRfUFVCTElDX1NVUEFCQVNFX1VSTCEsXG4gICAgICBwcm9jZXNzLmVudi5TVVBBQkFTRV9TRVJWSUNFX1JPTEUhXG4gICAgKVxuXG4gICAgLy8gVmVyaWZpY2FyIHF1ZSBlbCBwYXJ0aWRvIG5vIGVtcGV6w7MgKGV4Y2VwdG8gZW50cmV0aWVtcG8pXG4gICAgY29uc3QgeyBkYXRhOiBtYXRjaCB9ID0gYXdhaXQgc3VwYWJhc2VcbiAgICAgIC5mcm9tKCdtYXRjaGVzJylcbiAgICAgIC5zZWxlY3QoJ21hdGNoX2RhdGUsIHN0YXR1cycpXG4gICAgICAuZXEoJ2lkJywgbWF0Y2hfaWQpXG4gICAgICAuc2luZ2xlKClcblxuICAgIGlmICghbWF0Y2gpIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiAnUGFydGlkbyBubyBlbmNvbnRyYWRvJyB9LCB7IHN0YXR1czogNDA0IH0pXG5cbiAgICBjb25zdCBub3cgPSBEYXRlLm5vdygpXG4gICAgY29uc3Qga2lja29mZiA9IG5ldyBEYXRlKG1hdGNoLm1hdGNoX2RhdGUpLmdldFRpbWUoKVxuICAgIGNvbnN0IG1pbnNQYXNzZWQgPSAobm93IC0ga2lja29mZikgLyA2MDAwMFxuXG4gICAgLy8gQmxvcXVlYWRvIHNpIGVsIHBhcnRpZG8geWEgZW1wZXrDsyB5IG5vIGVzIGVudHJldGllbXBvXG4gICAgaWYgKG1pbnNQYXNzZWQgPiAwICYmICEobWluc1Bhc3NlZCA+PSA0NSAmJiBtaW5zUGFzc2VkIDw9IDY1KSkge1xuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgZXJyb3I6ICdObyBzZSBwdWVkZSBtb2RpZmljYXIg4oCUIHBhcnRpZG8gZW4gY3Vyc28nIH0sIHsgc3RhdHVzOiA0MDMgfSlcbiAgICB9XG5cbiAgICAvLyBVcHNlcnQgcHJlZGljY2nDs25cbiAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgICAgLmZyb20oJ3ByZWRpY3Rpb25zJylcbiAgICAgIC51cHNlcnQoe1xuICAgICAgICB1c2VyX2lkOiB1c2VySWQsXG4gICAgICAgIG1hdGNoX2lkLFxuICAgICAgICBwcmVkaWN0ZWRfd2lubmVyLFxuICAgICAgICBwcmVkaWN0ZWRfaG9tZV9zY29yZSxcbiAgICAgICAgcHJlZGljdGVkX2F3YXlfc2NvcmUsXG4gICAgICAgIHByZWRpY3RlZF9zY29yZXJzLFxuICAgICAgICBwcmVkaWN0ZWRfZmlyc3RfaGFsZl9nb2FscyxcbiAgICAgICAgcHJlZGljdGVkX3NlY29uZF9oYWxmX2dvYWxzLFxuICAgICAgICBwcmVkaWN0ZWRfcGVuYWx0aWVzLFxuICAgICAgICBsYXRlX2ZlZSxcbiAgICAgICAgZmlsbGVkX2F0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICB9LCB7IG9uQ29uZmxpY3Q6ICd1c2VyX2lkLG1hdGNoX2lkJyB9KVxuXG4gICAgaWYgKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdQcmVkaWN0aW9uIGVycm9yOicsIGVycm9yKVxuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfSwgeyBzdGF0dXM6IDUwMCB9KVxuICAgIH1cblxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IHN1Y2Nlc3M6IHRydWUgfSlcblxuICB9IGNhdGNoIChlcnIpIHtcbiAgICBjb25zb2xlLmVycm9yKGVycilcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBlcnJvcjogJ0Vycm9yIGludGVybm8nIH0sIHsgc3RhdHVzOiA1MDAgfSlcbiAgfVxufVxuIl0sIm5hbWVzIjpbIk5leHRSZXNwb25zZSIsImNyZWF0ZUNsaWVudCIsIlBPU1QiLCJyZXEiLCJib2R5IiwianNvbiIsInVzZXJJZCIsIm1hdGNoX2lkIiwicHJlZGljdGVkX3dpbm5lciIsInByZWRpY3RlZF9ob21lX3Njb3JlIiwicHJlZGljdGVkX2F3YXlfc2NvcmUiLCJwcmVkaWN0ZWRfc2NvcmVycyIsInByZWRpY3RlZF9maXJzdF9oYWxmX2dvYWxzIiwicHJlZGljdGVkX3NlY29uZF9oYWxmX2dvYWxzIiwicHJlZGljdGVkX3BlbmFsdGllcyIsImxhdGVfZmVlIiwiZXJyb3IiLCJzdGF0dXMiLCJzdXBhYmFzZSIsInByb2Nlc3MiLCJlbnYiLCJORVhUX1BVQkxJQ19TVVBBQkFTRV9VUkwiLCJTVVBBQkFTRV9TRVJWSUNFX1JPTEUiLCJkYXRhIiwibWF0Y2giLCJmcm9tIiwic2VsZWN0IiwiZXEiLCJzaW5nbGUiLCJub3ciLCJEYXRlIiwia2lja29mZiIsIm1hdGNoX2RhdGUiLCJnZXRUaW1lIiwibWluc1Bhc3NlZCIsInVwc2VydCIsInVzZXJfaWQiLCJmaWxsZWRfYXQiLCJ0b0lTT1N0cmluZyIsIm9uQ29uZmxpY3QiLCJjb25zb2xlIiwibWVzc2FnZSIsInN1Y2Nlc3MiLCJlcnIiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./app/api/predictions/route.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fpredictions%2Froute&page=%2Fapi%2Fpredictions%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fpredictions%2Froute.ts&appDir=%2FUsers%2Fadrianft%2FDesktop%2Fche-bacano-final%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fadrianft%2FDesktop%2Fche-bacano-final&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fpredictions%2Froute&page=%2Fapi%2Fpredictions%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fpredictions%2Froute.ts&appDir=%2FUsers%2Fadrianft%2FDesktop%2Fche-bacano-final%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fadrianft%2FDesktop%2Fche-bacano-final&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _Users_adrianft_Desktop_che_bacano_final_app_api_predictions_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/predictions/route.ts */ \"(rsc)/./app/api/predictions/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/predictions/route\",\n        pathname: \"/api/predictions\",\n        filename: \"route\",\n        bundlePath: \"app/api/predictions/route\"\n    },\n    resolvedPagePath: \"/Users/adrianft/Desktop/che-bacano-final/app/api/predictions/route.ts\",\n    nextConfigOutput,\n    userland: _Users_adrianft_Desktop_che_bacano_final_app_api_predictions_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZwcmVkaWN0aW9ucyUyRnJvdXRlJnBhZ2U9JTJGYXBpJTJGcHJlZGljdGlvbnMlMkZyb3V0ZSZhcHBQYXRocz0mcGFnZVBhdGg9cHJpdmF0ZS1uZXh0LWFwcC1kaXIlMkZhcGklMkZwcmVkaWN0aW9ucyUyRnJvdXRlLnRzJmFwcERpcj0lMkZVc2VycyUyRmFkcmlhbmZ0JTJGRGVza3RvcCUyRmNoZS1iYWNhbm8tZmluYWwlMkZhcHAmcGFnZUV4dGVuc2lvbnM9dHN4JnBhZ2VFeHRlbnNpb25zPXRzJnBhZ2VFeHRlbnNpb25zPWpzeCZwYWdlRXh0ZW5zaW9ucz1qcyZyb290RGlyPSUyRlVzZXJzJTJGYWRyaWFuZnQlMkZEZXNrdG9wJTJGY2hlLWJhY2Fuby1maW5hbCZpc0Rldj10cnVlJnRzY29uZmlnUGF0aD10c2NvbmZpZy5qc29uJmJhc2VQYXRoPSZhc3NldFByZWZpeD0mbmV4dENvbmZpZ091dHB1dD0mcHJlZmVycmVkUmVnaW9uPSZtaWRkbGV3YXJlQ29uZmlnPWUzMCUzRCEiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBK0Y7QUFDdkM7QUFDcUI7QUFDcUI7QUFDbEc7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLHlHQUFtQjtBQUMzQztBQUNBLGNBQWMsa0VBQVM7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLFlBQVk7QUFDWixDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsUUFBUSxzREFBc0Q7QUFDOUQ7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDMEY7O0FBRTFGIiwic291cmNlcyI6WyIiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBwUm91dGVSb3V0ZU1vZHVsZSB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIi9Vc2Vycy9hZHJpYW5mdC9EZXNrdG9wL2NoZS1iYWNhbm8tZmluYWwvYXBwL2FwaS9wcmVkaWN0aW9ucy9yb3V0ZS50c1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkvcHJlZGljdGlvbnMvcm91dGVcIixcbiAgICAgICAgcGF0aG5hbWU6IFwiL2FwaS9wcmVkaWN0aW9uc1wiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvcHJlZGljdGlvbnMvcm91dGVcIlxuICAgIH0sXG4gICAgcmVzb2x2ZWRQYWdlUGF0aDogXCIvVXNlcnMvYWRyaWFuZnQvRGVza3RvcC9jaGUtYmFjYW5vLWZpbmFsL2FwcC9hcGkvcHJlZGljdGlvbnMvcm91dGUudHNcIixcbiAgICBuZXh0Q29uZmlnT3V0cHV0LFxuICAgIHVzZXJsYW5kXG59KTtcbi8vIFB1bGwgb3V0IHRoZSBleHBvcnRzIHRoYXQgd2UgbmVlZCB0byBleHBvc2UgZnJvbSB0aGUgbW9kdWxlLiBUaGlzIHNob3VsZFxuLy8gYmUgZWxpbWluYXRlZCB3aGVuIHdlJ3ZlIG1vdmVkIHRoZSBvdGhlciByb3V0ZXMgdG8gdGhlIG5ldyBmb3JtYXQuIFRoZXNlXG4vLyBhcmUgdXNlZCB0byBob29rIGludG8gdGhlIHJvdXRlLlxuY29uc3QgeyB3b3JrQXN5bmNTdG9yYWdlLCB3b3JrVW5pdEFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MgfSA9IHJvdXRlTW9kdWxlO1xuZnVuY3Rpb24gcGF0Y2hGZXRjaCgpIHtcbiAgICByZXR1cm4gX3BhdGNoRmV0Y2goe1xuICAgICAgICB3b3JrQXN5bmNTdG9yYWdlLFxuICAgICAgICB3b3JrVW5pdEFzeW5jU3RvcmFnZVxuICAgIH0pO1xufVxuZXhwb3J0IHsgcm91dGVNb2R1bGUsIHdvcmtBc3luY1N0b3JhZ2UsIHdvcmtVbml0QXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgcGF0Y2hGZXRjaCwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fpredictions%2Froute&page=%2Fapi%2Fpredictions%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fpredictions%2Froute.ts&appDir=%2FUsers%2Fadrianft%2FDesktop%2Fche-bacano-final%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fadrianft%2FDesktop%2Fche-bacano-final&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(ssr)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "../app-render/after-task-async-storage.external":
/*!***********************************************************************************!*\
  !*** external "next/dist/server/app-render/after-task-async-storage.external.js" ***!
  \***********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/after-task-async-storage.external.js");

/***/ }),

/***/ "../app-render/work-async-storage.external":
/*!*****************************************************************************!*\
  !*** external "next/dist/server/app-render/work-async-storage.external.js" ***!
  \*****************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-async-storage.external.js");

/***/ }),

/***/ "./work-unit-async-storage.external":
/*!**********************************************************************************!*\
  !*** external "next/dist/server/app-render/work-unit-async-storage.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-unit-async-storage.external.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@supabase","vendor-chunks/tslib","vendor-chunks/iceberg-js"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fpredictions%2Froute&page=%2Fapi%2Fpredictions%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fpredictions%2Froute.ts&appDir=%2FUsers%2Fadrianft%2FDesktop%2Fche-bacano-final%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fadrianft%2FDesktop%2Fche-bacano-final&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();