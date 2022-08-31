import * as model from './model';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import bookmarksView from './views/bookmarksView.js';
import paginationView from './views/paginationView.js';
import addRecipeView from './views/addRecipeView.js';
import { MODAL_CLOSE_SEC } from './config.js';


import 'core-js/stable';
import 'regenerator-runtime/runtime';

if(module.hot) {
    module.hot.accept();
}

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

const controlRecipes = async function() {
  try {
    const id = window.location.hash.slice(1);
    if(!id) return

    recipeView.renderSpinner();

    //update result view to mark
    resultsView.update(model.getSearchResultsPage());
    bookmarksView.update(model.state.bookmarks);

    // loading recipe
    await model.loadRecipe(id);
    
    // rendering recipe
    recipeView.render(model.state.recipe)
  } catch (err) {
      recipeView.renderError();
  }
}

const controlSearchResults = async function() {
    try{
        // render spinner
        resultsView.renderSpinner();

        // get search query
        const query = searchView.getQuery();
        if(!query) return;

        // load query results
        await model.loadSearchResults(query);
        // render results
        //resultsView.render(model.state.search.results);
        resultsView.render(model.getSearchResultsPage());

        // render initial pagination
        paginationView.render(model.state.search);
    } catch(err) {
        console.log(err);
    }
}

const controlPagination = function(goToPage) {
    // render new results
    resultsView.render(model.getSearchResultsPage(goToPage));

    // render new pagination
    paginationView.render(model.state.search);
}

const controlServings = function (newServings) {
    // update recipe servings (in state)
    // updatinf recipe view
    model.updateServings(newServings);

    // update recipe view
    recipeView.update(model.state.recipe)
}

const controlAddBookmark = function() {
    // add or remove bookmarks
    if(!model.state.recipe.bookmarked) model.addBookmarks(model.state.recipe);
    else if(model.state.recipe.bookmarked) model.deleteBookmark(model.state.recipe.id);

    // update recipe view
    recipeView.update(model.state.recipe);

    // render bookmark view
    bookmarksView.render(model.state.bookmarks);
}

const controlBookmarks = function() {
    bookmarksView.render(model.state.bookmarks);
}

const controlAddrecipe = async function (newRecipe) {
    try {
        // render spinner
        addRecipeView.renderSpinner();

        await model.uploadRecipe(newRecipe);
        console.log(model.state.recipe);

        // render recipe in recipe view
        recipeView.render(model.state.recipe);

        // render success message
        addRecipeView.renderMessage();

        // add bookmark view
        bookmarksView.render(model.state.bookmarks);

        //change ID in URL
        window.history.pushState(null,'',`#${model.state.recipe.id}`);

        // close form window
        setTimeout(function () {
         addRecipeView.toggleWindow();   
        },MODAL_CLOSE_SEC*1000);
    } catch(err) {
        console.log(`💥`,err);
        addRecipeView.renderError(err.message);
    }
    
}

const init = function() {
    bookmarksView.addHandlerRender(controlBookmarks);
    recipeView.addHandlerRecipe(controlRecipes);
    recipeView.addHandlerUpdateServings(controlServings);
    recipeView.addhandlerAddbookmark(controlAddBookmark);
    searchView.addHandlerSearch(controlSearchResults);
    paginationView.addhandlerClick(controlPagination);
    addRecipeView.addHandlerUpload(controlAddrecipe);
}


init();

// window.addEventListener(`hashchange`, controlRecipes);
// window.addEventListener(`load`, controlRecipes);

