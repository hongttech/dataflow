( function(Dataflow) {

  var Source = Dataflow.prototype.plugin("source");

  Source.initialize = function(dataflow){

    var $form = $( 
      '<form class="dataflow-plugin-view-source">'+
        '<div style="position: absolute; top:5px; left:5px; bottom:35px; right:5px;">'+
          '<textarea class="code" style="width:100%; height:100%; margin:0; padding: 0;"></textarea><br/>'+
        '</div>'+
        '<input class="apply" type="submit" value="apply changes" style="position: absolute; right:5px; bottom:5px;" />'+
      '</form>'
    );
    var $code = $form.find(".code");

    dataflow.addPlugin({
      id: "source", 
      name: "view source", 
      menu: $form, 
      icon: "cog"
    });

    var show = function(source) {
      var scrollBackTop = $code.prop("scrollTop");
      $code.val( source );
      $code.scrollTop( scrollBackTop );
    };

    Source.show = show;

    // On change update code view
    dataflow.on("change", function(graph){
      if (dataflow.graph) {
        show( JSON.stringify(dataflow.graph.toJSON(), null, "  ") );
      }
    });

    // Apply source to test graph
    $form.submit(function(){
      var graph;
      try {
        graph = JSON.parse( $code.val() );
      } catch(error){
        dataflow.log("Invalid JSON");
        return false;
      }
      if (graph) {
        var g = dataflow.loadGraph(graph);
        g.trigger("change");
      }
      return false;
    });
    
  };

}(Dataflow) );
