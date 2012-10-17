( function(Output) {

  var Edge = Dataflow.module("edge");
 
  var template = 
    '<span class="label out"><%= id %></span>'+
    '<span class="hole out" title="drag to make new wire"></span>'+
    '<span class="plug out" title="drag to edit wire"></span>';

  Output.Views.Main = Backbone.View.extend({
    template: _.template(template),
    tagName: "li",
    className: "port out",
    events: {
      "dragstart .hole":  "newEdgeStart",
      "drag .hole":       "newEdgeDrag",
      "dragstop .hole":   "newEdgeStop",
      "dragstart .plug":  "changeEdgeStart",
      "drag .plug":       "changeEdgeDrag",
      "dragstop .plug":   "changeEdgeStop",
      "drop":             "connectEdge"
    },
    initialize: function () {
      this.$el.html(this.template(this.model.toJSON()));
      this.$el.addClass(this.model.get("type"));
      var self = this;
      this.$(".plug").draggable({
        helper: function(){
          return $('<span class="plug out helper" />');
        },
        disabled: true
      });
      this.$(".hole").draggable({
        helper: function(){
          return $('<span class="plug in helper" />')
            .data({port: self.model});
        }
      });
      this.$el.droppable({
        accept: ".plug.out, .hole.in",
        activeClassType: "droppable-hover"
      });
    },
    render: function () {
    },
    newEdgeStart: function(event, ui){
      // Don't drag node
      event.stopPropagation();
      this.previewEdge = new Edge.Model({
        source: {
          node: this.model.node.id,
          port: this.model.id
        },
        graph: this.model.node.graph,
        preview: true
      });
      this.previewEdgeView = new Edge.Views.Main({
        model: this.previewEdge
      });
      var graphSVGElement = this.model.node.graph.view.$('.svg-edges')[0];
      graphSVGElement.appendChild(this.previewEdgeView.el);
    },
    newEdgeDrag: function(event, ui){
      // Don't drag node
      event.stopPropagation();
      this.model.node.graph.edges.view.sizeSvg();
      this.previewEdgeView.render(ui.offset);
    },
    newEdgeStop: function(event, ui){
      // Don't drag node
      event.stopPropagation();

      // Clean up preview edge
      this.previewEdgeView.remove();
      delete this.previewEdge;
      delete this.previewEdgeView;
    },
    changeEdgeStart: function(event, ui){
      // Don't drag node
      event.stopPropagation();

      if (this.isConnected){
        var changeEdge = this.model.node.graph.edges.find(function(edge){
          return edge.source === this.model;
        }, this);
        if (changeEdge){
          this.changeEdge = changeEdge;
          ui.helper.data({
            port: changeEdge.target
          });
          this.previewEdgeChange = new Edge.Model({
            target: changeEdge.get("target"),
            graph: this.model.node.graph,
            preview: true
          });
          this.previewEdgeChangeView = new Edge.Views.Main({
            model: this.previewEdgeChange
          });
          var graphSVGElement = this.model.node.graph.view.$('.svg-edges')[0];
          graphSVGElement.appendChild(this.previewEdgeChangeView.el);
        }
      }
    },
    changeEdgeDrag: function(event, ui){
      // Don't drag node
      event.stopPropagation();

      if (this.previewEdgeChange) {
        this.model.node.graph.edges.view.sizeSvg();
        this.previewEdgeChangeView.render(ui.offset);
      }
    },
    changeEdgeStop: function(event, ui){
      // Don't drag node
      event.stopPropagation();

      // Clean up preview edge
      if (this.previewEdgeChange) {
        this.previewEdgeChangeView.remove();
        if (this.changeEdge) {
          this.changeEdge.collection.remove(this.changeEdge);
          this.changeEdge = null;
        }
        delete this.previewEdgeChange;
        delete this.previewEdgeChangeView;
      }
    },
    connectEdge: function(event, ui) {
      // Dropped to this el
      var otherPort = ui.helper.data("port");
      this.model.node.graph.edges.add({
        id: this.model.node.id+":"+this.model.id+"→"+otherPort.node.id+":"+otherPort.id,
        graph: this.model.node.graph,
        source: {
          node: this.model.node.id,
          port: this.model.id
        },
        target: {
          node: otherPort.node.id,
          port: otherPort.id
        }
      });
    },
    holePosition: function () {
      return this.$(".hole").offset();
    },
    plugSetActive: function(){
      this.$(".plug").draggable("enable");
      this.$(".plug").addClass("active");
      this.isConnected = true;
    },
    plugCheckActive: function(){
      var isConnected = this.model.node.graph.edges.some(function(edge){
        // var port = edge.get("source");
        // return (port.node === this.model.node.id && port.port === this.model.id);
        return (edge.source === this.model);
      }, this);
      if (!isConnected) {
        this.$(".plug").draggable("disable");
        this.$(".plug").removeClass("active");
        this.isConnected = false;
      }
    }
  });

  Output.Views.Collection = Backbone.CollectionView.extend({
    tagName: "ul",
    itemView: Output.Views.Main
  }); 

}(Dataflow.module("output")) );
