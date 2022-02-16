import requests
import pandas as pd
import shutil
import datetime

SEASON = "season_1"

SRC = {
	"season_1": {
		"game": "https://docs.google.com/spreadsheets/d/1TbIgYjH7Z5k5-Q3Duln2yfyKsyDnoOhxR88KfINxMtk/edit#gid=0",
		"answer_options": "https://docs.google.com/spreadsheets/d/1es5fHaTkzZwoRcfnqa-GcMoYtB53r1sUkvaNuetCZ_w/edit#gid=0",
	}
}

DST = {
	"season_1": {
		"game": "csv/primeira-temporada.csv",
		"answer_options": "csv/primeira-temporada-estadios-validos.csv",
	}
}


def timestamp():
	'''
	Creates a timestamp with
	the time of the last update.
	'''

	now = datetime.datetime.now()
	now = now.strftime("%Y%m%d_%H-%M-%S")
	with open("last-updated.txt", "w+") as f:
		f.write(now)


def read_csv(src):
	'''
	Downloads CSV from specified link. 
	'''

	src = src.replace('/edit#gid=', '/export?format=csv&gid=')
	df = pd.read_csv(src)
	return df


def clean_answer_options(game, answer_options):
	'''
	Makes sure that answers include the correct one.
	'''
	correct_answers = game.nome
	answer_options = answer_options.estadios

	series = pd.concat([correct_answers, answer_options])
	series = series.sort_values().drop_duplicates().to_frame().rename(columns={0:"estadios"})

	return series

def download_imgs():
	'''
	Downloads all images specified in the id.
	'''

	df = pd.read_csv(DST[SEASON]['game'])

	srcs = df.id_google.tolist()
	srcs = [ f"https://drive.google.com/uc?export=view&id={src}" for src in srcs ]

	dsts = df.arquivo.tolist()
	dsts = [ "img/" + dst for dst in dsts ]

	for src, dst in zip(srcs, dsts):
		r = requests.get(src, stream=True)
		if r.status_code == 200:
		    with open(dst, 'wb') as f:
		        r.raw.decode_content = True
		        shutil.copyfileobj(r.raw, f)
		else:
			print(f"error {r.status_code}")


def main():

	game = read_csv(SRC[SEASON]['game'])
	answer_options = read_csv(SRC[SEASON]['answer_options'])

	answer_options = clean_answer_options(game, answer_options)

	game.to_csv(DST[SEASON]['game'] ,index=False)
	answer_options.to_csv(DST[SEASON]['answer_options'] ,index=False)

	download_imgs()

	timestamp()

if __name__ == "__main__":
	main()