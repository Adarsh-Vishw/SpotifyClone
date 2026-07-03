
let currentSong = new Audio();
let songs;
let currFolder;

function formatTime(seconds) {
     if (
        typeof seconds !== "number" ||
        isNaN(seconds) ||
        seconds < 0
    ) {
        return "00:00";
    }
    let minutes = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);

    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

async function getSongs(folder){
    currFolder = folder;
    let a = await fetch(`./${currFolder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.endsWith(".mp3"))
            songs.push(element.href.split(`/${currFolder}/`)[1]);
        
    }

    // show all songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
                  <img  src="img/music.svg" alt="">
                  <div class="info">
                     <div>${song.replaceAll("%20", " ")}</div>
                     <div>Adarsh Kr.</div>
                  </div>
                  <div class="playnow">
                    <span>Play Now</span>
                    <img  src="img/play1.svg" alt="">
                  </div></li>`;           
    }

    // attach  event listener to each song
     Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element=>{
            playMusic(e.querySelector(".info").firstElementChild.innerHTML);

        })
     });

     return songs
    

}

const playMusic = (track, pause = false)=>{
    currentSong.src = `/${currFolder}/`+track;
    if(!pause){
        currentSong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
   

}


async function displayAlbums() {
    let a = await fetch("./songs/");
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if(e.href.includes("/songs/")){
            let folder = e.href.split("/").slice(-1)[0];
            // get the metadata of the folder
            let a = await fetch(`./songs/${folder}/info.json`);
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder ="${folder}" class="card">
              <div class="play">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">

                    <!-- Green Circle -->
                    <circle cx="24" cy="24" r="24" fill="#1ed760"/>

                    <!-- Play Icon -->
                    <path fill="black"
                          d="M16 12 L36 24 L16 36 Z"/>
                </svg>
              </div> 
              <img src="/songs/${folder}/cover.jpeg" alt="">
              <h3>${response.title}</h3>
              <p>${response.description}</p>
            </div>`
        }
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click",async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
    })
   })
}

async function main(){

    // get the list of all songs
    await getSongs("songs/ncs");
    playMusic(songs[0],true);

    // Display all the albums on the page
    displayAlbums();

   // attached event listener to play , next and previous
   play.addEventListener("click",()=>{
        if(currentSong.paused){
            currentSong.play();
            play.src = "img/pause.svg";
        }
        else{
            currentSong.pause();
            play.src =  "img/play1.svg";
        }
   });
    
   // listen for timeupdate Event
   currentSong.addEventListener("timeupdate",()=>{
    document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
    document.querySelector(".circle").style.left = (currentSong.currentTime/ currentSong.duration) * 100 + "%";
   })

   // add an event listener on seekbar
   document.querySelector(".seekbar").addEventListener("click" , e =>{
    let percent = (e.offsetX/e.target.getBoundingClientRect().width) * 100;
     document.querySelector(".circle").style.left = percent + "%";
     currentSong.currentTime = (currentSong.duration) * percent / 100;
   })

   // add an Event listener on hamburger
   document.querySelector(".hamburger").addEventListener("click", ()=>{
      document.querySelector(".left").style.left = "0"
   })

   // add an Event listener on close button
   document.querySelector(".close").addEventListener("click", ()=>{
      document.querySelector(".left").style.left = "-120%"
   })

   // add an event listener to previous  
   document.querySelector("#previous").addEventListener("click",()=>{
    console.log("previous click")
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if(index-1 >= 0){
        playMusic(songs[index - 1]);
    }

   })

    // add an event listener to  next button 
   document.querySelector("#next").addEventListener("click",()=>{
    console.log("next Clicked");
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if(index +1 < songs.length){
        playMusic(songs[index + 1]);
    }

   })
   // add event listener to range (volume)
   document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
    console.log("set volume",e.target.value,"/ 100")
    currentSong.volume =parseInt( e.target.value) / 100;
    if(currentSong.volume >0){
        document.querySelector(".volume  >  img").src = "img/volume.svg";
    }
   })
   
   // add Event listner to mute the track
   document.querySelector(".volume  >  img").addEventListener("click", e=>{
     if(e.target.src.includes("img/volume.svg")){
        e.target.src = "img/mute.svg"
        currentSong.volume = 0;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
     }else{
        e.target.src = "img/volume.svg"; 
        currentSong.volume = 0.15;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 15;
     }
   })
 
}
main();
