APPFILE=adhdclock.app.js
BUILDDIR=build
DOWNLOADDIR=storage

# ----primary build targets-----------------------------------

clean:
	rm -rf $(BUILDDIR)

build: clean build-tsc build-rollup build-uglify	

install: build upload

deploy: build
	cp ./$(BUILDDIR)/$(APPFILE) ~/repos/BangleApps/apps/adhdclock/app.js
	cd ~/repos/BangleApps && git commit -a -m "Update adhdclock/app.js" && git push

# ----granular build targets-----------------------------------

build-tsc:
	tsc

build-rollup:
	rollup ./$(BUILDDIR)/tsout/timer.app.js --file ./$(BUILDDIR)/bundle.js --format cjs

build-uglify:
	uglifyjs --compress --mangle --toplevel ./$(BUILDDIR)/bundle.js -o ./$(BUILDDIR)/$(APPFILE)

# ---espruino targets--------------------------------------

download: COMMAND=espruino -d "Bangle.js cd9f" --download "$(FILE)"
download: retry
	mkdir -p $(BUILDDIR)/$(DOWNLOADDIR)
	mv $(FILE) $(BUILDDIR)/$(DOWNLOADDIR)/$(FILE)

watch: build uploadandwatch

web: COMMAND=espruino -d "Bangle.js cd9f" --ide
web: openbrowser retry
openbrowser:
	open http://localhost:8080

upload: COMMAND=espruino -d "Bangle.js cd9f" "./$(BUILDDIR)/$(APPFILE)" --storage $(APPFILE):-
upload: retry

uploadandwatch: COMMAND=espruino -d "Bangle.js cd9f" -w "$(BUILDDIR)/$(APPFILE)" --storage $(APPFILE):-
uploadandwatch: retry

retry:
	until $(COMMAND); do    \
		echo "Retrying..."; \
		sleep 1;            \
	done

# -- Download From Watch -------------------------

downloadevents: FILE=adhdclock.events
downloadevents: download

downloadcalendar: FILE=android.calendar.json
downloadcalendar: download

downloadapp: FILE=$(APPFILE)
downloadapp: download

downloadlog: FILE=adhdclock.eventlog
downloadlog: download
	code $(BUILDDIR)/$(DOWNLOADDIR)/$(FILE)

downloadall: downloadevents downloadcalendar downloadapp


# -- Offline -------------------------
#     --config "MODULE_URL=http://localhost:8080" 

downloadbuildfiles:
	curl --fail http://www.espruino.com/json/BANGLEJS2.json > remotefiles/BANGLEJS2.json
	curl --fail https://www.espruino.com/modules/FontDennis8.min.js > remotefiles/FontDennis8.min.js
	curl --fail https://raw.githubusercontent.com/espruino/BangleApps/master/apps/sched/sched.js > remotefiles/sched.js

startfileserver: stopfileserver
	python -m http.server 8080 --bind 127.0.0.1 --directory remotefiles &

stopfileserver:
	ps -x | grep -v grep | grep "python -m http.server 8080" | cut  -d" " -f1 | xargs kill
