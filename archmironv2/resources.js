function gameBuffering(map) {

    const xhttp = new XMLHttpRequest();

    xhttp.onload = function() {
        var json = JSON.parse(this.responseText);
        map.tileMap = json;
        var tileImg = new Image();
        tileImg.src = "./map/" + json.tileName;
        tileImg.onload = function () {
            map.tileMapImage = this;
            map.tileMap.neighbor = tileOrganize(map);
            console.log(map.tileMap.neighbor);
            createGameObjects(map);
            // gameStart(map);
        };
    }

    xhttp.open("GET", "./tileMap.json");
    xhttp.send();

}
