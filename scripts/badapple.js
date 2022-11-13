window.BadAppleWidget = class extends NeonWidget {
    playButton;
    isSetup = false;
    
    render_internal(painter,options) {
        if (!this.isSetup) {
            this.playButton = new NeonButtonWidget();
            this.isSetup = true;
            this.playButton.text = "Play";
            this.playButton.onclick = () => {
                this.badApple.play();
            }
            var badAppleUrl = "https://guidipolito.github.io/Bad_apple_JS/Badapplesmall.mp4";
            this.badApple = document.createElement("video");
            this.badApple.src = badAppleUrl;
            this.badAppleRenderer = document.createElement("canvas");
            this.badAppleRenderer.width = 150;
            this.badAppleRenderer.height = 112;
            this.badAppleRendererContext = this.badAppleRenderer.getContext('2d');
        }

        if (this.badApple.currentTime != 0) {
            this.badAppleRendererContext.drawImage(this.badApple,0,0,this.badAppleRenderer.width,this.badAppleRenderer.height);
            console.log(this.getPixel(0,0)); //99% chance of a memory leak KEKW
        } else {
            this.playButton.render(painter,options);
        }
    }

    getPixel(x,y) {
        return this.badAppleRendererContext.getImageData(x,y,1,1).data[0];
    }
}