window.BadAppleWidget = class extends NeonWidget {
    playButton;
    isSetup = false;
    
    render_internal(painter,options) {
        if (!isSetup) {
            this.playButton = new NeonButton();
            isSetup = true;
            this.playButton.text = "Play";
            var badAppleUrl = "https://guidipolito.github.io/Bad_apple_JS/Badapplesmall.mp4";
            this.badApple = document.createElement("video");
            badApple.src = badAppleUrl;
            this.badAppleRenderer = document.createElement("canvas");
            badAppleRenderer.width = 150;
            badAppleRenderer.height = 112;
            this.badAppleRendererContext = badAppleRenderer.getContext('2d');
        }

        if (this.badApple.currentTime != 0) {
            this.badAppleRendererContext.drawImage(this.badApple,0,0,this.badAppleRenderer.width,this.badAppleRenderer.height);
        } else {
            this.playButton.render(painter,options);
        }
    }
}