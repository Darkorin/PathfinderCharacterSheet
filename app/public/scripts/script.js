//Gets the current character ID
$(document).ready(() => {
  const getCharId = () => {
    let url = window.location.href;
    url = url.split('/');
    return url[url.length - 1];
  }

  const charId = getCharId();

  //  ----------CAROUSELS -----------------

  $(document).ready(function () {
    $("#myCarousel").on("slide.bs.carousel", function (e) {
      var $e = $(e.relatedTarget);
      var idx = $e.index();
      var itemsPerSlide = 3;
      var totalItems = $(".carousel-item").length;

      if (idx >= totalItems - (itemsPerSlide - 1)) {
        var it = itemsPerSlide - (totalItems - idx);
        for (var i = 0; i < it; i++) {
          // append slides to end
          if (e.direction == "left") {
            $(".carousel-item")
              .eq(i)
              .appendTo(".carousel-inner");
          } else {
            $(".carousel-item")
              .eq(0)
              .appendTo($(this).find(".carousel-inner"));
          }
        }
      }
    });
  });

  //---- RANGE SLIDERS ---------

  const rangeSlider = function () {
    const slider = $('.range-slider'),
      range = $('.range-slider__range'),
      value = $('.range-slider__value');

    slider.each(function () {

      value.each(function () {
        const value = $(this).prev().attr('value') + '/' + $(this).prev().attr('max');
        $(this).html(value);
      });

      range.on('input', function () {
        $(this).next(value).html(this.value + "/" + this.max);
      });
    });
  };

  rangeSlider();

  //   -----STATS.HTML ------ tab/page transition
  $(document).ready(function () {

    $(".next-step").click(function (e) {

      var $active = $('.nav-tabs li.active');
      $active.next().removeClass('disabled');
      nextTab($active);

    });
    $(".prev-step").click(function (e) {

      var $active = $('.nav-tabs li.active');
      prevTab($active);

    });
  });
  function nextTab(elem) {
    $(elem).next().find('a[data-toggle="tab"]').click();
  }
  function prevTab(elem) {
    $(elem).prev().find('a[data-toggle="tab"]').click();
  }
  //-------- USER INPUT NOTES ----------
  const createButton = document.querySelector('.createButton, .createButtonSpell');
  const noteCreator = document.querySelector('.noteCreator, .noteCreatorSpell');
  const noteTitle = document.querySelector('.noteTitle, .noteTitleSpell');
  const noteBody = document.querySelector('.noteBody, .noteBodySpell');
  const saveButton = document.querySelector('.saveButton, .saveButtonSpell');

  const createdNotes = document.querySelector('.createdNotes, .createdNotesSpell');
  const savedNotesDB = [];

  let idCounter = -1;
  let i = -1;

  //Fade in, fade out
  function fadeIn(el) {
    el.classList.add('show');
    el.classList.remove('hide');
  }
  function fadeOut(el) {
    el.classList.add('hide');
    el.classList.remove('show');
  }

  //Show and hide Note Creator
  createButton.addEventListener('click', () => {
    if (noteCreator.className.indexOf('hide') !== -1) {
      fadeIn(noteCreator);
    } else {
      fadeOut(noteCreator);
    }
  });

  //Reset Editor
  function resetEditor() {
    noteTitle.value = '';
    noteBody.value = '';
    fadeOut(noteCreator);
  }

  //Object printer
  function printObject(elementToCreate, className, dbContent, placeLocation) {
    let printBody = document.createElement(elementToCreate);
    printBody.className = className;
    printBody.innerHTML = dbContent;
    if (printBody.className === 'savedNote') {
      idCounter += 1;
      i += 1;
      printBody.id = 'n' + idCounter;
    };
    document.querySelector(placeLocation).appendChild(printBody);
  };

  //Create new note
  function handleNote(noteContent) {
    savedNotesDB.push(noteContent);

    if (noteContent.title !== '' || noteContent.body !== '') {
      //Print content
      printObject('div', 'savedNote', '', '.createdNotes');
      printObject('h2', 'savedNoteTitle', savedNotesDB[i].title, '.savedNote:last-child');
      printObject('p', 'savedNoteBody', savedNotesDB[i].body, '.savedNote:last-child');

      let printDelete = document.createElement('a');
      printDelete.innerHTML = 'delete';
      printDelete.className = 'deleteButton';
      printDelete.onclick = function () {
        let childToDelete = document.getElementById('n' + idCounter);
        createdNotes.removeChild(childToDelete);
        savedNotesDB.splice(idCounter,1);
        $.post(`/api/${charId}/items`, JSON.stringify(savedNotesDB));
        idCounter -= 1;
      };
      document.querySelector('.savedNote:last-child').appendChild(printDelete);

      resetEditor();
    } else {
      resetEditor();
      savedNotesDB.pop();
    }
  }

  saveButton.addEventListener('click', () => {
    const noteContent = {
      title: '',
      body: ''
    }
    //Push content to the DB
    noteContent.title = noteTitle.value;
    noteContent.body = noteBody.value;

    handleNote(noteContent);
    $.post(`/api/${charId}/items`, JSON.stringify(savedNotesDB));
  });

  $.get(`/api/${charId}/items`).then(res => {
    res.forEach(item => {
      handleNote(item);
    })
  })

  //-------- List Functions  ----------
  $(function () {
    function moveItems(origin, dest) {
      $(origin).find(':selected').appendTo(dest);
      const featList = [];
      const featNodes = $('#feats1').children().toArray();
      //$('#feats1').children().forEach(feat => {
      for(let i = 0; i < featNodes.length; i++) {
        featList.push({featName: featNodes[i].text});
      }
      $.post(`/api/${charId}/knownFeats`, JSON.stringify(featList));
    }

    // function moveAllItems(origin, dest) {
    //   $(origin).children().appendTo(dest);
    // }

    function displayFeat(origin) {
      $('#featDisplay').empty();
      let listName = ($(origin).find(':selected').val());
      $.get(`/api/feats/${listName}`).then(res => {
        $('#featDisplayName').text(res.name);
        for (let i = 0; i < res.sections.length; i++) {
          if (res.sections[i].name === 'Prerequisites') {
            $('#featDisplay').append(`<h4>${res.sections[i].name}: ${res.sections[i].description}</h4>`);
          } else {
            $('#featDisplay').append(`<h4>${res.sections[i].name}:</h4>`).append(`${res.sections[i].body}`);
          }
        }
      })
    }

    function displayTrait(origin) {
      $('#traitDisplay').empty();
      let listName = ($(origin).find(':selected').val());
      let listRace = ($(origin).find(':selected').attr('data-race'));
      $.get(`/api/traits/${listRace}/${listName}`).then(res => {
        $('#traitDisplayName').text(res.name);
        $('#traitDisplay').append(res.body)
        if (res.description != undefined) $('#traitDisplay').append(`description: ${res.description}`);
      })
    }

    $('#feats1').on('click keyup',function () { displayFeat('#feats1') });
    $('#feats2').on('click keyup',function () { displayFeat('#feats2') });
    $('#traits').on('click keyup', function () { displayTrait('#traits') });

    $('#left').click(function () { moveItems('#feats2', '#feats1') });
    $('#right').click(function () { moveItems('#feats1', '#feats2') });

    // $('#leftall').on('click', function () {
    //   moveAllItems('#sbTwo', '#sbOne');
    // });

    // $('#rightall').on('click', function () {
    //   moveAllItems('#sbOne', '#sbTwo');
    // });
  });
})