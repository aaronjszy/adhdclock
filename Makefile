APPFILE=adhdclock.app.js
BUILDDIR=build
DOWNLOADDIR=storage

# ----primary build targets-----------------------------------

clear:
	rm -rf $(BUILDDIR)

build: clear build-tsc build-rollup build-uglify	

install: build upload

deploy: build
	cp adhdclock.app.js ~/repos/BangleApps/apps/adhdclock/app.js
	cd ~/repos/BangleApps && git commit -a -m "Update adhdclock/app.js" && git push

# ----granular build targets-----------------------------------

build-tsc:
	tsc

build-rollup:
	rollup ./$(BUILDDIR)/tsout/timer.app.js --file ./$(BUILDDIR)/bundle.js --format cjs

build-uglify:
	uglifyjs  --compress --mangle --toplevel ./$(BUILDDIR)/bundle.js -o ./$(BUILDDIR)/$(APPFILE)

# ---espruino targets--------------------------------------

download: COMMAND=espruino -d "Bangle.js cd9f" --download "$(FILE)"
download: retry
	mkdir -p $(DOWNLOADDIR)
	cat "$(FILE)" | jq . | sponge "$(FILE)"
	mv $(FILE) $(DOWNLOADDIR)/$(FILE)

watch: build uploadandwatch

web: COMMAND=espruino -d "Bangle.js cd9f" --ide
web: openbrowser retry
openbrowser:
	open http://localhost:8080

upload: COMMAND=espruino -d "Bangle.js cd9f" "./$(BUILDDIR)/$(APPFILE)"
upload: retry

uploadandwatch: COMMAND=espruino -d "Bangle.js cd9f" -w "$(BUILDDIR)/$(APPFILE)"
uploadandwatch: retry

downloadevents: FILE=adhdclock.events
downloadevents: download

downloadcalendar: FILE=android.calendar.json
downloadcalendar: download

downloadall: downloadevents downloadcalendar

retry:
	until $(COMMAND); do    \
		echo "Retrying..."; \
		sleep 1;            \
	done
