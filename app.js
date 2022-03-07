const NOIMAGE = "ftfile-broken.png"

async function searchShows(query) {
    /* 
    hard coded data
        {
            id: 1767,
            name: "The Bletchley Circle",
            summary:"<p><b>The Bletchley Circle</b> follows the journey of four ordinary women with extraordinary skills that helped to end World War II.</p><p>Set in 1952, Susan, Millie, Lucy and Jean have returned to their normal lives, modestly setting aside the part they played in producing crucial intelligence, which helped the Allies to victory and shortened the war. When Susan discovers a hidden code behind an unsolved murder she is met by skepticism from the police. She quickly realises she can only begin to crack the murders and bring the culprit to justice with her former friends.</p>",
            image: "http://static.tvmaze.com/uploads/images/medium_portrait/147/369403.jpg",
        },
    */
    let response = await axios.get(`https://api.tvmaze.com/search/shows?q=${query}`);
    let showQuery = response.data.map(function(result){
        let show = result.show;
        return {
                id: show.id,
                name: show.name,
                summary:show.summary,
                image: show.image ? show.image.original : NOIMAGE,
            };
        });
    return showQuery;
}

/* 
Populate shows list:
- given list of shows, add shows to DOM
*/

function populateShows(shows) {
    const $showsList = $("#shows-list");
    $showsList.empty();

    for (let show of shows) {
        let $item = $(
            `
            <div class="col-md-6 col-lg-3 show" data-show-id="${show.id}">
                <div class="card" data-show-id="${show.id}">
                <img class="card-img-top" src="${show.image}">
                    <div class="card-body">
                        <h5 class="card-title">${show.name}</h5>
                        <p class="card-text">${show.summary}</p>
                        <button class="btn btn-primary episodes">Episodes</button>
                    </div>
                </div>
            </div>
            `
        );
        $showsList.append($item);
    }
}

/* 
Handle search form submission:
- hide episodes area
- get list of matching shows and show in shows list
*/

$("#search-form").on("submit", async function handleSearch(evt) {
    evt.preventDefault();

    let query = $("#search-query").val();
    if (!query) return;

    $("#episodes-area").hide();

    let shows = await searchShows(query);

    populateShows(shows);
});

/* 
Given a show ID, return list of episodes:
{ id, name, season, number }
*/

async function getEpisodes(id) {
    let response = await axios.get(`https://api.tvmaze.com/shows/${id}/episodes`);
    let episodeQuery = response.data.map(function(result){
        let episode = result;
        return {
                id: episode.id,
                name: episode.name,
                season: episode.season,
                number: episode.number
            };
        });
    return episodeQuery;
}

function populateEpisodes(episodes) {
    const $episodeList = $("#episodes-list");
    $episodeList.empty();

    for (let episode of episodes) {
        let $item = $(
            `
            <li>
                Season ${episode.season} - ep. ${episode.number} - ${episode.name}
            </li>
            `
        );
        $episodeList.append($item);
    }
    $("#episodes-area").show();
}

//click event handler that will show epsiodes
$("#shows-list").on("click", ".episodes", async function handleEpisodes(evt){
    let showId = $(evt.target).closest(".show").data("show-id");
    let episodeList = await getEpisodes(showId);
    populateEpisodes(episodeList);
})