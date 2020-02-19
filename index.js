const fs = require('fs');
const fetch = require('node-fetch');
const { spawn } = require('child_process');

const ESPORTAL_BASE = 'https://api.esportal.com';

async function get_esportal_demos(esportal_username) {
	const esportal_user = `${ESPORTAL_BASE}/user_profile/get?username=${esportal_username}`;
	
	let esportal_uid;

	try {
		const { id } = await fetch_data(esportal_user);
		esportal_uid = id;
	} catch(error_code) {
		if (error_code === 404) {
			return console.log('Username does not exist in esportal');
		}
	}

	const esportal_latest_matches = `${ESPORTAL_BASE}/user_profile/get_latest_matches?id=${esportal_uid}`;
	const matches = await fetch_data(esportal_latest_matches);
	
	for (const match of matches) {
		if (demo_already_parsed()) {
			continue;
		}

		const demolink = `https://s3.eu-central-1.wasabisys.com/demo-production/${match.id}.dem`
		const file = fs.createWriteStream(`esportal_demo_${match.id}.dem`);
		const ls = spawn('curl', [demolink]);

		ls.stdout.on('data', data => {
			file.write(data);
		});

		ls.stdout.on('end', () => {
			file.close();
		});

		ls.on('close', _ => {
			console.log('do something with the demo file with id', match.id);
		});
	}
}

function fetch_data(url) {
	return new Promise(async (resolve, reject) => {
		const response = await fetch(url);
		
		if (response.ok) {
			const json = await response.json();
			return resolve(json);
		}

		return reject(response.status);
	});
}

function demo_already_parsed(match_id) {
	// TODO: check if the match has already
	// been parsed by leetify.

	return false
}


get_esportal_demos('larvenlucas');