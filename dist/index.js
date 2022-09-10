"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const rest_1 = require("@octokit/rest");
const promises_1 = require("fs/promises");
const exec_1 = require("@actions/exec");
const axios_1 = __importDefault(require("axios"));
var author;
console.log("Starting somethingNEW!!!!!!!");
const getCommitInfo = async (username) => {
    const github = new rest_1.Octokit({});
    core.notice(`Fetching ${username} public events`);
    const data = await github.activity
        .listPublicEventsForUser({ username: username, per_page: 100 })
        .then(({ data }) => data)
        .catch(({ response }) => {
        if (response?.status === 404)
            core.setFailed('User not found');
        else
            core.setFailed(`Failed with ${response?.status ? response?.status : 'undefined error'}`);
        return null;
    });
    const allData = await github.activity
        .listPublicEventsForUser({ username: username, per_page: 100 })
        .then(({ data }) => data)
        .catch(({ response }) => {
        if (response?.status === 404)
            core.setFailed('User not found');
        else
            core.setFailed(`Failed with ${response?.status ? response?.status : 'undefined error'}`);
        return null;
    });
    if (!data)
        return { error: { type: 500 } };
    const pushEvent = data.find((event) => {
        if (event.type === 'PushEvent') {
            const payload = event.payload;
            if (!payload.commits || payload.commits.length === 0)
                return false;
            return true;
        }
        return false;
    });
    const AllpushEvents = data.filter((event) => {
        if (event.type === 'PushEvent') {
            const payload = event.payload;
            if (!payload.commits || payload.commits.length === 0)
                return false;
            return true;
        }
        return false;
    });
    if (!pushEvent) {
        core.setFailed('Could not find any recent commits');
        return { error: { type: 404 } };
    }
    var payload = pushEvent.payload;
    console.table(getData(AllpushEvents));
    console.log("==================================================================");
    var newData = getData(AllpushEvents);
    console.log("This is one of the data mode from the string");
    console.table(newData[0]);
    console.log("????????????????????????????????????????????????????????????????");
    var newdata2 = getthedata(AllpushEvents);
    console.log("This is one of the data mode from the string UPDATED VERION");
    console.table(newdata2);
    console.log("????????????????????????????????????????????????????????????????");
    author = data.find(actor => actor.actor.display_login);
    return { data: newdata2 };
};
var dataarray = [];
var dataarray2 = [];
function getthedata(AllpushEvents) {
    const size = 5;
    let allpayload = AllpushEvents.slice(0, size).map(a => a.payload);
    let event = AllpushEvents.slice(0, size).map(a => a.repo.name);
    AllpushEvents = AllpushEvents.slice(0, size);
    var sendData;
    for (var element of AllpushEvents) {
        sendData = {
            message: element.payload.commits[0].message,
            repo: element.repo.name,
            sha: element.payload.commits[0].sha,
        },
            dataarray.push(sendData);
    }
    ;
    return dataarray;
}
function getData(AllpushEvents) {
    const size = 5;
    let allpayload = AllpushEvents.slice(0, size).map(a => a.payload);
    let event = AllpushEvents.slice(0, size).map(a => a.repo.name);
    var lol;
    AllpushEvents = AllpushEvents.slice(0, size);
    for (var element of AllpushEvents) {
        lol = {
            message: element.payload.commits[0].message,
            repo: element.repo.name,
            sha: element.payload.commits[0].sha,
        };
        dataarray2.push(lol);
    }
    ;
    return dataarray2;
}
const assembleGithubUrl = (data) => {
    return `https://github.com/${data.repo}/commit/${data.sha}`;
};
const fetchImageFromUrl = async (url) => {
    const response = await (0, axios_1.default)(`https://opengraph.lewagon.com/?url=${url}`);
    if (response.status !== 200) {
        core.setFailed('Failed to fetch image');
        return null;
    }
    return response.data.data.image;
};
const createImageMarkdown2 = (data, commitUrl) => {
    return `${'\n'}[<div>${data.message}] ->  ${data.repo} by  ${author}.</div>[commitUrl]${'\n\n'}[commitUrl]: ${commitUrl} `;
};
const updateReadmeFile = async (line) => {
    core.notice(`Reading README.md`);
    const readmeFile = await (0, promises_1.readFile)('./README.md', 'utf-8').catch((error) => {
        if (error.code === 'ENOENT')
            core.setFailed("This repository doesn't have README.md");
        else
            core.setFailed(`Failed to read README.md, error: ${error.code}`);
        return null;
    });
    if (!readmeFile)
        return false;
    const readmeFileLines = readmeFile.split('\n');
    let startI = readmeFileLines.findIndex((content) => content.trim() === '<!-- LATESTCOMMIT:START -->');
    let endI = readmeFileLines.findIndex((content) => content.trim() === '<!-- LATESTCOMMIT:END -->');
    if (startI === -1 || endI === -1) {
        core.setFailed(`Could not found \`<!-- LATESTCOMMIT:${startI === -1 ? 'START' : 'END'} -->\` in file`);
        return false;
    }
    core.notice("endid is: " + endI);
    core.notice("startI is: " + startI);
    var difference = endI - (startI + 1);
    core.notice("endid - startid is: " + difference);
    if (difference < 18) {
        readmeFileLines.splice(startI + 1, 0, line);
    }
    else {
        core.info("inside the else meaning difference is bigger than 18: deifference now is :" + difference);
        readmeFileLines.splice(startI + 1, endI - startI - 1, line);
    }
    const newFile = readmeFileLines.join('\n');
    if (newFile === readmeFile) {
        core.warning('No new commits nothing changed, not commits been done');
        return false;
    }
    await (0, promises_1.writeFile)('./README.md', newFile);
    core.notice('Updated README');
    return true;
};
const commitAndPush = async (data) => {
    await (0, exec_1.exec)('git', [
        'config',
        '--global',
        'user.email',
        '41898282+github-actions[bot]@users.noreply.github.com>',
    ]);
    await (0, exec_1.exec)('git', ['config', '--global', 'user.name', 'last-commit-bot']);
    await (0, exec_1.exec)('git', ['add', 'README.md']);
    await (0, exec_1.exec)('git', [
        'commit',
        '-m',
        `update last commit\n\nthe new commit is ${data.repo}@${data.sha}`,
    ]);
    await (0, exec_1.exec)('git', ['push']);
};
async function run() {
    const username = core.getInput('GH_USERNAME');
    if (!username) {
        core.setFailed('Username could not be found');
        return;
    }
    var { data, error } = await getCommitInfo(username);
    if (error || !data) {
        core.notice("The data model is not correct");
        console.table(data);
        return;
    }
    else {
        core.notice("TOTALLY CORRECT DATA!!");
    }
    var dataReverse = data.slice().reverse();
    for (var dataElement of dataReverse) {
        const commitUrl = assembleGithubUrl(dataElement);
        core.notice(`Found commit in ${dataElement.repo}`);
        core.notice(`Fetching social preview image`);
        const imageUrl = await fetchImageFromUrl(commitUrl);
        if (!imageUrl)
            return;
        const markdown = createImageMarkdown2(dataElement, commitUrl);
        const updated = await updateReadmeFile(markdown);
        if (!updated)
            return;
    }
    ;
    commitAndPush(data[4]);
}
run();
//# sourceMappingURL=index.js.map