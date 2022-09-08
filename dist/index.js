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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
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
exports.__esModule = true;
var core = require("@actions/core");
var rest_1 = require("@octokit/rest");
var promises_1 = require("fs/promises");
var exec_1 = require("@actions/exec");
var axios_1 = require("axios");
/**
 * Fetch the user events, look for the `pushEvent` type and return
 * object with information about the commit
 * @param username: the github user username
 */
var getCommitInfo = function (username) { return __awaiter(void 0, void 0, void 0, function () {
    var github, data, pushEvent, payload, index;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                github = new rest_1.Octokit({});
                core.notice("Fetching ".concat(username, " public events"));
                return [4 /*yield*/, github.activity
                        .listPublicEventsForUser({ username: username, per_page: 100 })
                        .then(function (_a) {
                        var data = _a.data;
                        return data;
                    })["catch"](function (_a) {
                        var response = _a.response;
                        if ((response === null || response === void 0 ? void 0 : response.status) === 404)
                            core.setFailed('User not found');
                        else
                            core.setFailed("Failed with ".concat((response === null || response === void 0 ? void 0 : response.status) ? response === null || response === void 0 ? void 0 : response.status : 'undefined error'));
                        return null;
                    })];
            case 1:
                data = _a.sent();
                if (!data)
                    return [2 /*return*/, { error: { type: 500 } }];
                pushEvent = data.find(function (event) {
                    if (event.type === 'PushEvent') {
                        var payload_1 = event.payload;
                        if (!payload_1.commits || payload_1.commits.length === 0)
                            return false;
                        return true;
                    }
                    return false;
                });
                if (!pushEvent) {
                    core.setFailed('Could not find any recent commits');
                    return [2 /*return*/, { error: { type: 404 } }];
                }
                payload = pushEvent.payload;
                for (index = 0; index < 10; index++) {
                    console.log("this is my number: {0}", index);
                    // const element = array[i].push( data: {
                    //   message: payload.commits[i].message,
                    //   repo: pushEvent.repo.name,
                    //   sha: payload.commits[i].sha,
                    // });
                }
                return [2 /*return*/, {
                        data: {
                            message: payload.commits[0].message,
                            repo: pushEvent.repo.name,
                            sha: payload.commits[0].sha
                        }
                    }];
        }
    });
}); };
/**
 * create the commit github url that will be used to get social preview and return it as string
 * @param data: object with data about the commit
 */
var assembleGithubUrl = function (data) {
    return "https://github.com/".concat(data.repo, "/commit/").concat(data.sha);
};
/**
 * Fetch the commit social preview from opengraph api
 * @param url: commit url in github
 */
var fetchImageFromUrl = function (url) { return __awaiter(void 0, void 0, void 0, function () {
    var response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, axios_1["default"])("https://opengraph.lewagon.com/?url=".concat(url))];
            case 1:
                response = _a.sent();
                if (response.status !== 200) {
                    core.setFailed('Failed to fetch image');
                    return [2 /*return*/, null];
                }
                return [2 /*return*/, response.data.data.image];
        }
    });
}); };
var createImageMarkdown = function (imageUrl, commitUrl) {
    return "".concat('\n', "[<img width=\"380px\" height=\"200px\" src=\"").concat(imageUrl, "\" />][commitUrl]").concat('\n\n', "[commitUrl]: ").concat(commitUrl);
};
/**
 * open and parse the README file, then replace the commit line with latest one
 * @param line: the new commit line
 */
var updateReadmeFile = function (line) { return __awaiter(void 0, void 0, void 0, function () {
    var readmeFile, readmeFileLines, startI, endI, newFile;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                core.notice("Reading README.md");
                return [4 /*yield*/, (0, promises_1.readFile)('./README.md', 'utf-8')["catch"](function (error) {
                        if (error.code === 'ENOENT')
                            core.setFailed("This repository doesn't have README.md");
                        else
                            core.setFailed("Failed to read README.md, error: ".concat(error.code));
                        return null;
                    })];
            case 1:
                readmeFile = _a.sent();
                if (!readmeFile)
                    return [2 /*return*/, false];
                readmeFileLines = readmeFile.split('\n');
                startI = readmeFileLines.findIndex(function (content) { return content.trim() === '<!-- LATESTCOMMIT:START -->'; });
                endI = readmeFileLines.findIndex(function (content) { return content.trim() === '<!-- LATESTCOMMIT:END -->'; });
                if (startI === -1 || endI === -1) {
                    core.setFailed("Could not found `<!-- LATESTCOMMIT:".concat(startI === -1 ? 'START' : 'END', " -->` in file"));
                    return [2 /*return*/, false];
                }
                readmeFileLines.splice(startI + 1, startI + 1 === endI ? 0 : endI - startI - 1, line);
                newFile = readmeFileLines.join('\n');
                if (newFile === readmeFile) {
                    core.warning('No new commits nothing changed, not commits been done');
                    return [2 /*return*/, false];
                }
                return [4 /*yield*/, (0, promises_1.writeFile)('./README.md', newFile)];
            case 2:
                _a.sent();
                core.notice('Updated README');
                return [2 /*return*/, true];
        }
    });
}); };
/**
 * Commit the file updates, and push them
 * @param data: object with data about the commit
 */
var commitAndPush = function (data) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, exec_1.exec)('git', [
                    'config',
                    '--global',
                    'user.email',
                    '41898282+github-actions[bot]@users.noreply.github.com>',
                ])];
            case 1:
                _a.sent();
                return [4 /*yield*/, (0, exec_1.exec)('git', ['config', '--global', 'user.name', 'last-commit-bot'])];
            case 2:
                _a.sent();
                return [4 /*yield*/, (0, exec_1.exec)('git', ['add', 'README.md'])];
            case 3:
                _a.sent();
                return [4 /*yield*/, (0, exec_1.exec)('git', [
                        'commit',
                        '-m',
                        "update last commit\n\nthe new commit is ".concat(data.repo, "@").concat(data.sha),
                    ])];
            case 4:
                _a.sent();
                return [4 /*yield*/, (0, exec_1.exec)('git', ['push'])];
            case 5:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var username, _a, data, error, commitUrl, imageUrl, markdown, updated;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    username = core.getInput('GH_USERNAME');
                    if (!username) {
                        core.setFailed('Username could not be found');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, getCommitInfo(username)];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error || !data)
                        return [2 /*return*/];
                    commitUrl = assembleGithubUrl(data);
                    core.notice("Found commit in ".concat(data.repo));
                    core.notice("Fetching social preview image");
                    return [4 /*yield*/, fetchImageFromUrl(commitUrl)];
                case 2:
                    imageUrl = _b.sent();
                    if (!imageUrl)
                        return [2 /*return*/];
                    markdown = createImageMarkdown(imageUrl, commitUrl);
                    return [4 /*yield*/, updateReadmeFile(markdown)];
                case 3:
                    updated = _b.sent();
                    if (!updated)
                        return [2 /*return*/];
                    commitAndPush(data);
                    return [2 /*return*/];
            }
        });
    });
}
run();
