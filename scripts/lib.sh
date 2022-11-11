
gotoprojectroot() {
    local currentdir
    currentdir=$(pwd)
    while [ ! -f "$currentdir/package.json" ]; do
        currentdir=$(dirname "$currentdir")
    done
    cd "$currentdir" || exit
}

prefix() {
    awk '{ print "    ", $0 }'
}

retry() {
    until "$@"; do
        echo "Retrying..."
        sleep 1
    done
}

upload() {
    gotoprojectroot
    retry espruino -d "Bngle.js cd9f" "$1"
}

uploadandwatch() {
    gotoprojectroot
    retry espruino -d "Bngle.js cd9f" -w "$1"
}

build() {
    gotoprojectroot
    ./scripts/build.sh
}

download() {
    gotoprojectroot
    retry espruino -d "Bangle.js cd9f" --download "$1"
    mkdir -p storage
    cat "$1" | jq . | sponge "$1"
    mv $1 storage/$1
}
