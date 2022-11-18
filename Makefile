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
	uglifyjs  --compress --mangle --toplevel ./$(BUILDDIR)/bundle.js -o ./$(BUILDDIR)/$(APPFILE)

# ---espruino targets--------------------------------------

download: COMMAND=espruino -d "Bangle.js cd9f" --download "$(FILE)"
download: retry
	mkdir -p $(BUILDDIR)/$(DOWNLOADDIR)
	mv $(FILE) $(BUILDDIR)/$(DOWNLOADDIR)/$(FILE)
# cat "$(FILE)" | jq . | sponge "$(FILE)"

watch: build uploadandwatch

web: COMMAND=espruino -d "Bangle.js cd9f" --ide
web: openbrowser retry
openbrowser:
	open http://localhost:8080

upload: COMMAND=espruino -d "Bangle.js cd9f" "./$(BUILDDIR)/$(APPFILE)" --storage $(APPFILE):-
upload: retry

uploadandwatch: COMMAND=espruino -d "Bangle.js cd9f" -w "$(BUILDDIR)/$(APPFILE)" --storage $(APPFILE):-
uploadandwatch: retry

downloadevents: FILE=adhdclock.events
downloadevents: download

downloadcalendar: FILE=android.calendar.json
downloadcalendar: download

downloadapp: FILE=$(APPFILE)
downloadapp: download

downloadall: downloadevents downloadcalendar downloadapp

retry:
	until $(COMMAND); do    \
		echo "Retrying..."; \
		sleep 1;            \
	done
