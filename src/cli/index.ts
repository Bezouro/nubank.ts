#!/usr/bin/env node

import CreateCert from './createCert';

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Usage: nubankts <command>');
  console.log('Commands:');
  console.log('  create-cert');
  process.exit(0);
}

const command = args.shift();

switch (command) {
case 'create-cert':
  CreateCert();
  break;

default:
  console.log('Unknown command:', command);
  process.exit(1);
}