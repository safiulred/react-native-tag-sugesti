var React = require('react');
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ListView,
  TouchableOpacity,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';

const styles = StyleSheet.create({
  container : {
    flex : 1,
  },
  input: {
    height : 50,
    borderRadius : 3,
    borderWidth : 1,
    borderColor : '#D7D7D7',
    padding : 15,
    flexWrap: 'wrap',
    flex : 6,
  },
  list: {
    backgroundColor: '#d0d0d0',
    borderTopWidth: 0,
    margin: 10,
    top : 50,
    marginTop: 0,
    position : 'absolute',
    left : 0,
    right : 0,
    width : width,
    maxHeight : 100,
  },
  wrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 3,
    marginBottom : 2,
    alignItems: 'flex-start'
  },
  textInput: {
    height: 36,
    fontSize: 16,
    flex: .6,
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  tag: {
    padding: 0,
    justifyContent: 'center',
    marginTop: 6,
    marginRight: 3,
    flexWrap: 'wrap',
    padding: 8,
    height: 24,
    borderRadius: 2
  },
  tagText: {
    padding: 0,
    margin: 0
  }
});

const {height, width} = Dimensions.get('window');
const TagSugesti = React.createClass({
  getInitialState : function () {
    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    return {
      dataSource : this.props.data ? ds.cloneWithRows(this.props.data) : ds.cloneWithRows([]),
      showResults: this.props.data && this.props.data.length > 0,
      text : "",
      inputWidth : 200,
    }
  },

  componentDidMount : function () {
    this.wrapperWidth = width;
    setTimeout(() => {
      this.calculateWidth();
    }, 100);
  },

  measureWrapper : function () {
    if (!this.refs.wrapper)
      return;
    this.refs.wrapper.measure((ox, oy, w, h, px, py) => {
      this.wrapperWidth = w;
    });
  },

  calculateWidth : function () {
    setTimeout(() => {
      if (!this.refs['tag' + (this.props.value.length - 1)])
        return;
      this.refs['tag' + (this.props.value.length - 1)].measure((ox, oy, w, h, px, py) => {

        let endPosOfTag = w + ox;
        let margin = 3;
        let spaceLeft = this.wrapperWidth - endPosOfTag - margin;
        if (spaceLeft < 100) {
          this.setState({inputWidth: this.wrapperWidth});
        } else {
          this.setState({inputWidth: spaceLeft});
        }
      });
    }, 0);
  },

  componentDidUpdate : function (prevProps, prevState) {
    if (prevProps.value.length != this.props.value.length || !prevProps.value) {
      this.calculateWidth();
    }
  },

  onChange : function (event) {
    if (!event || !event.nativeEvent)
      return;
    let text = event.nativeEvent.text;
    this.setState({text: text});
    let lastTyped = text.charAt(text.length - 1);
    let parseWhen = [",", " ", ";"];
    if (parseWhen.indexOf(lastTyped) > -1)
      this.parseTags();
  },

  parseTags : function () {
    var {text} = this.state;
    let {value} = this.props;
    let regex = this.props.regex || /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
    text = text.toLowerCase();
    let results = text.match(regex);
    if (results && results.length > 0) {
      var cek = value.indexOf(results[0]);
      this.setState({text: ""});
      if (cek == -1 ) {
        this.props.onChange(value.concat(results));
      } else {
        this.props.onChange(value);
      }
    }
  },

  pop : function () {
    let tags = _.clone(this.props.value);
    tags.pop();
    this.props.onChange(tags);
    this.focus();
  },

  removeIndex : function (index) {
    let tags = _.clone(this.props.value);
    tags.splice(index, 1);
    this.props.onChange(tags);
    this.focus();

  },

  componentWillReceiveProps : function (nextProps) {
    this.calculateWidth();
    const dataSource = this.state.dataSource.cloneWithRows(nextProps.data);
    this._showResults(dataSource.getRowCount() > 0);
    this.setState({ dataSource });
  },

  _showResults : function (show) {
    const { showResults } = this.state;
    const { onShowResults } = this.props;
    if (!showResults && show) {
      this.setState({ showResults: true });
      onShowResults && onShowResults(true);
    } else if (showResults && !show) {
      this.setState({ showResults: false });
      onShowResults && onShowResults(false);
    }
  },

  _renderItems : function () {
    const { listStyle, renderItem } = this.props;
    const { dataSource, showResults } = this.state;
    var myIndex = {};
    if (showResults) {
      myIndex = { zIndex : 1};
    } else {
      myIndex = {};
    }
    return (
      <ListView
        ref = "listItem"
        dataSource={dataSource}
        keyboardShouldPersistTaps = {true}
        renderRow={renderItem}
        style = {[styles.list, myIndex , listStyle]}/>
    );
  },

  render : function () {
    const {text } = this.state;
    let {value, inputProps} = this.props;

    let defaultInputProps = {
      autoCapitalize : "none",
      autoCorrect : false,
      placeholder : this.props.placeholder || "Start typing",
      returnKeyType : this.props.returnKeyType || "done",
      keyboardType : this.props.keyboardType || "default",
    }

    inputProps = {...defaultInputProps, ...this.props};
    let width = text.length < 4 ? 100 : null;
    let tagColor = this.props.tagColor || "#dddddd";
    let tagTextColor = this.props.tagTextColor || "#777777";
    let inputColor = this.props.inputColor || "#000";

    return (
      <View>
        <View
          style = {styles.wrapper}
          ref = "wrapper"
          onLayout = {this.measureWrapper}>
          {value.map((tag, index) => {
            return (
              <TouchableOpacity
                key = {index}
                ref = {"tag" + index}
                style = {[styles.tag, {backgroundColor: tagColor}]}
                onPress = {() => {
                  this.removeIndex(index);
                }}>
                <Text
                  style = {[styles.tagText, { color: tagTextColor}]}>
                  {tag}&nbsp;&times;
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
        <View style = {[styles.container, this.props.containerStyle]}>
          <View>
            <TextInput
              ref = "tagInput"
              {...inputProps}
              blurOnSubmit = {false}
              onKeyPress = {this.onKeyPress}
              value = {this.state.text}
              style = {[styles.textInput, {color: inputColor}, this.props.style]}
              onChange = {this.onChange}
              onSubmitEditing = {this.parseTags}/>
          </View>
          {this._renderItems()}
        </View>
      </View>
    );
  },
});

export default TagSugesti;
