import * as core from '@actions/core';
import { Octokit } from '@octokit/rest';
import { readFile, writeFile } from 'fs/promises';
import { exec } from '@actions/exec';
import axios from 'axios';
import { appendFile, appendFileSync } from 'fs';

type CommitInfoData = {
  message: string;
  repo: string;
  sha: string;
};

interface CommitInfo {
  data?: CommitInfoData[];
  error?: {
    type: 404 | 500;
  };
}

console.log("Starting somethingNEW!!!!!!!");
/**
 * Fetch the user events, look for the `pushEvent` type and return
 * object with information about the commit
 * @param username: the github user username
 */
const getCommitInfo = async (username: string): Promise<CommitInfo> => {
  const github = new Octokit({});

  core.notice(`Fetching ${username} public events`);

  const data = await github.activity
    .listPublicEventsForUser({ username: username, per_page: 100 })
    .then(({ data }) => data)
    .catch(({ response }) => {
      if (response?.status === 404) core.setFailed('User not found');
      else
        core.setFailed(
          `Failed with ${
            response?.status ? response?.status : 'undefined error'
          }`
        );
      return null;
    });

  const allData = await github.activity
    .listPublicEventsForUser({ username: username, per_page: 100 })
    .then(({ data }) => data)
    .catch(({ response }) => {
      if (response?.status === 404) core.setFailed('User not found');
      else
        core.setFailed(
          `Failed with ${
            response?.status ? response?.status : 'undefined error'
          }`
        );
      return null;
    });


  if (!data) return { error: { type: 500 } };

  const pushEvent = data.find((event) => {
    if (event.type === 'PushEvent') {
      const payload = event.payload as any;
      if (!payload.commits || payload.commits.length === 0) return false;

      return true;
    }
    return false;
  });

  // var allpayload2;
  const AllpushEvents = data.filter((event) => {
    if (event.type === 'PushEvent') {
      const payload = event.payload as any;
      if (!payload.commits || payload.commits.length === 0) return false;

      return true;
    }
    return false;
  });
//console.log("-------------------------------------------------------------")
//console.table(AllpushEvents);
// console.log("-------------------------------------------------------------")
// var size = 10;
//    let allpayload = AllpushEvents.slice(0, size).map(a => a.payload)as any;
//    let event = AllpushEvents.slice(0, size).map(a => a.repo.name);


//    console.table(allpayload);
//    console.log("----------------*************************---------------------------------------------")
//    console.table(allpayload.map((pay) => pay.commits[0]));
//    console.log("#################################################################################################")
//    console.table(event);
  if (!pushEvent) {
    core.setFailed('Could not find any recent commits');
    return { error: { type: 404 } };
  }
   var payload = pushEvent.payload as any;

// var loco : CommitInfoData;
// var dataPopulated = allpayload.map((pay) => pay.commits[0].message);

//   console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
//   console.table(getthedata(allpayload));
//   console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");




  console.table(getData(AllpushEvents));
console.log("==================================================================")
  var newData =getData(AllpushEvents);
  console.log("This is one of the data mode from the string")
  console.table(newData[0]);

  console.log("????????????????????????????????????????????????????????????????")
  var newdata2 = getthedata(AllpushEvents);
  console.log("This is one of the data mode from the string UPDATED VERION")
  console.table(newdata2);
  console.log("????????????????????????????????????????????????????????????????")


  
//   var updatedmodal: CommitInfo

 
//  updatedmodal = { 
//   data: {
//     message: payload.commits[0].message,
//     repo: pushEvent?.repo.name,
//     sha: payload.commits[0].sha,
//   },
//   };

  // return {
  //   data: {
  //     message: payload.commits[0].message,
  //     repo: pushEvent?.repo.name,
  //     sha: payload.commits[0].sha,
  //   },
  // };
  return {data: newdata2};

  //return updatedmodal;


  // return newData[0] as CommitInfo;
};

var dataarray: CommitInfoData[] =[];
var dataarray2: CommitInfoData[] =[];

function getthedata(AllpushEvents)
{
  const size = 5;
  let allpayload = AllpushEvents.slice(0, size).map(a => a.payload)as any;
  let event = AllpushEvents.slice(0, size).map(a => a.repo.name);
  AllpushEvents =AllpushEvents.slice(0, size);
  var sendData: CommitInfoData
  for( var element of AllpushEvents)
    {


      sendData = {
          message: element.payload.commits[0].message,
          repo: element.repo.name,
          sha: element.payload.commits[0].sha,
        }as CommitInfoData,


      dataarray.push(sendData)
    };
    return dataarray

}

function getData(AllpushEvents)
{
  const size = 5;
  let allpayload = AllpushEvents.slice(0, size).map(a => a.payload)as any;
  let event = AllpushEvents.slice(0, size).map(a => a.repo.name);
  var lol;
  AllpushEvents =AllpushEvents.slice(0, size);
  for( var element of AllpushEvents)
    {
      lol =  {
        message: element.payload.commits[0].message,
        repo: element.repo.name,
        sha: element.payload.commits[0].sha,
      } as CommitInfoData
      dataarray2.push(lol)
    };
    return dataarray2;
}
// function populate(message:string, reponame : string, sha: string)
// function populate(payload: any): CommitInfo
// {
//   return {
//     data: {
//       message: payload.message,
//       repo: payload.author.email,
//       sha: payload.author.name,
//     },
//   };
// }
/**
 * create the commit github url that will be used to get social preview and return it as string
 * @param data: object with data about the commit
 */
const assembleGithubUrl = (data: CommitInfoData): string => {
  return `https://github.com/${data.repo}/commit/${data.sha}`;
};

/**
 * Fetch the commit social preview from opengraph api
 * @param url: commit url in github
 */
const fetchImageFromUrl = async (url: string): Promise<string | null> => {
  const response = await axios(`https://opengraph.lewagon.com/?url=${url}`);

  if (response.status !== 200) {
    core.setFailed('Failed to fetch image');
    return null;
  }
  return response.data.data.image;
};

const createImageMarkdown = (imageUrl: string, commitUrl: string): string => {
  return `${'\n'}[<img width="380px" height="200px" src="${imageUrl}" />][commitUrl]${'\n\n'}[commitUrl]: ${commitUrl}`;
};

/**
 * open and parse the README file, then replace the commit line with latest one
 * @param line: the new commit line
 */
const updateReadmeFile = async (line: string): Promise<boolean> => {
  core.notice(`Reading README.md`);
  const readmeFile = await readFile('./README.md', 'utf-8').catch((error) => {
    if (error.code === 'ENOENT')
      core.setFailed("This repository doesn't have README.md");
    else core.setFailed(`Failed to read README.md, error: ${error.code}`);
    return null;
  });
  if (!readmeFile) return false;

  const readmeFileLines = readmeFile.split('\n');

  let startI = readmeFileLines.findIndex(
    (content) => content.trim() === '<!-- LATESTCOMMIT:START -->'
  );

  let endI = readmeFileLines.findIndex(
    (content) => content.trim() === '<!-- LATESTCOMMIT:END -->'
  );

  if (startI === -1 || endI === -1) {
    core.setFailed(
      `Could not found \`<!-- LATESTCOMMIT:${
        startI === -1 ? 'START' : 'END'
      } -->\` in file`
    );
    return false;
  }

  readmeFileLines.splice(
    startI + 1,
    startI + 1 === endI ? 0 : endI - startI - 1,
    line
  
  );

  const newFile = readmeFileLines.join('\n');

  if (newFile === readmeFile) {
    core.warning('No new commits nothing changed, not commits been done');
    return false;
  }

  // await appendFileSync('./README.md', newFile);
  await writeFile('./README.md', newFile);
  core.notice('Updated README');

  return true;
};

/**
 * Commit the file updates, and push them
 * @param data: object with data about the commit
 */
const commitAndPush = async (data: CommitInfoData) => {
  await exec('git', [
    'config',
    '--global',
    'user.email',
    '41898282+github-actions[bot]@users.noreply.github.com>',
  ]);
  await exec('git', ['config', '--global', 'user.name', 'last-commit-bot']);
  await exec('git', ['add', 'README.md']);
  await exec('git', [
    'commit',
    '-m',
    `update last commit\n\nthe new commit is ${data.repo}@${data.sha}`,
    // `update last commit\n\nthe new commit is ${data.repo}@${data.sha}`,
  ]);
  await exec('git', ['push']);
};

async function run() {
  const username = core.getInput('GH_USERNAME');

  if (!username) {
    core.setFailed('Username could not be found');
    return;
  }

  // const { data, error } = await getCommitInfo(username);
  // if (error || !data) {
  //   core.notice("The data model is not correct")
  //   console.table(data);
  //   return;
  // }
  // else{
  //   core.notice("TOTALLY CORRECT DATA!!")
  // }

  var { data, error } = await getCommitInfo(username);
  if (error || !data) {
    core.notice("The data model is not correct")
    console.table(data);
    return;
  }
  else{
    core.notice("TOTALLY CORRECT DATA!!")
  }
var dataReverse = data.slice().reverse();
  for( var dataElement of dataReverse)
  // data.slice().reverse().forEach(async function(dataElement)
  {

  const commitUrl = assembleGithubUrl(dataElement);
  core.notice(`Found commit in ${dataElement.repo}`);

  core.notice(`Fetching social preview image`);
  const imageUrl = await fetchImageFromUrl(commitUrl);
  if (!imageUrl) return;

  const markdown = createImageMarkdown(imageUrl, commitUrl);
  const updated = await updateReadmeFile(markdown);

  if (!updated) return;
 
  };


  commitAndPush(data[4]);
}
run();
