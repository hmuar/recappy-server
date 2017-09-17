#! /usr/bin/env node

import { notifyDevUser, notifyWithUserID, notifyAllUsers, notifyTest } from '~/notification';
import inquirer from 'inquirer';

const questions = [
  {
    type: 'list',
    name: 'userType',
    message: 'Who do you want to notify?',
    choices: [
      {
        name: '[Developer] Hemu',
        value: 'dev',
      },
      {
        name: 'Single User',
        value: 'single',
      },
      {
        name: 'ALL Users',
        value: 'all',
      },
      {
        name: 'Test',
        value: 'test',
      }
    ],
  },
  {
    type: 'confirm',
    name: 'sendAll',
    message: 'Are you SURE you want to notify ALL users?',
    default: 'false',
    when: answers => answers.userType === 'all',
  },
  {
    type: 'input',
    name: 'userID',
    message: 'What is the user ID?',
    when: answers => answers.userType === 'single',
  }
];

inquirer.prompt(questions).then(answers => {
  if (answers.userType === 'dev') {
    notifyDevUser();
  } else if (answers.userType === 'all' && answers.sendAll) {
    notifyAllUsers();
  } else if (answers.userType === 'single') {
    notifyWithUserID(answers.userID);
  } else if (answers.userType === 'test') {
    notifyTest();
  }
});
