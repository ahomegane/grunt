do (window = window, document = document, $ = jQuery, _ptl = window._ptl || {}) ->

  class ViewInit

    constructor: ->

    init: ->
      @addBrowerFlag()
      @changeImageOnHover()

    addBrowerFlag: ->
      $.each _ptl.browser, (key, value) ->        
        if value
          $('html').addClass key

    changeImageOnHover: ->
      $('img.hover, .hover img').each ->
        src = $(@).attr('src')
        tmp = $('<img />').attr('src', src)
        if ! src
          src = $(@).find('img').eq(0).attr 'src'
        if ! src
          return
        $(@).on 'mouseenter', () ->
          $(@).attr 'src', src.replace(/^(.+)\.(jpg|gif|png)$/, '$1_on.$2')
        $(@).on 'mouseleave', () ->
          $(@).attr 'src', src

  $ () ->
    (new ViewInit).init()

  return