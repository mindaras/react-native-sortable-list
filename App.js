import React, { Component } from "react";
import {
  StyleSheet,
  SafeAreaView,
  FlatList,
  View,
  Text,
  Animated,
  Dimensions
} from "react-native";
import {
  gestureHandlerRootHOC,
  PanGestureHandler,
  State
} from "react-native-gesture-handler";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const ITEM_HEIGHT = 40;

const Handle = () => (
  <View style={styles.handle}>
    <View style={styles.handleLine} />
    <View style={styles.handleLine} />
    <View style={styles.handleLine} />
  </View>
);

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: props.data,
      activeIndex: 2,
      yValues: props.data.reduce((acc, curr, index) => {
        acc[index] = new Animated.Value(0);
        return acc;
      }, {})
    };
  }

  static defaultProps = {
    data: [
      { title: "Item 1" },
      { title: "Item 2" },
      { title: "Item 3" },
      { title: "Item 4" }
    ]
  };

  onGestureEvent = index => {
    return Animated.event([{ nativeEvent: { y: this.state.yValues[index] } }], {
      useNativeDriver: true
    });
  };

  updateData = data => {
    setTimeout(() => {
      this.setState({
        data,
        yValues: data.reduce((acc, curr, index) => {
          acc[index] = new Animated.Value(0);
          return acc;
        }, {})
      });
    }, 300);
  };

  onHandlerStateChange = index => ({ nativeEvent }) => {
    if (nativeEvent.state === State.ACTIVE) {
      this.setState({ activeIndex: index });
    }

    if (nativeEvent.state === State.END) {
      const initialPosition = index * ITEM_HEIGHT;
      const currentPosition = initialPosition + nativeEvent.y;
      const indexBasedOnPosition = Math.round(currentPosition / ITEM_HEIGHT);
      const lastIndex = this.state.data.length - 1;
      const newIndex =
        indexBasedOnPosition > lastIndex ? lastIndex : indexBasedOnPosition;
      const newIndexPosition = newIndex * ITEM_HEIGHT;
      const newData = [...this.state.data];
      const item = newData.splice(index, 1)[0];
      newData.splice(newIndex, 0, item);
      Animated.spring(this.state.yValues[index], {
        toValue: newIndexPosition - initialPosition,
        speed: 24,
        useNativeDriver: true,
        isInteraction: false
      }).start(this.updateData(newData));
    }
  };

  getTranslateY = index => {
    const { activeIndex } = this.state;

    if (activeIndex === index) return this.state.yValues[index];

    const separation =
      activeIndex > index ? activeIndex - index : index - activeIndex;
    const nonReactiveDistance = separation * ITEM_HEIGHT - ITEM_HEIGHT;
    const swappingDistance = nonReactiveDistance + ITEM_HEIGHT;

    if (activeIndex > index) {
      return this.state.yValues[activeIndex].interpolate({
        inputRange: [
          -SCREEN_HEIGHT,
          -swappingDistance,
          -nonReactiveDistance,
          SCREEN_HEIGHT
        ],
        outputRange: [ITEM_HEIGHT, ITEM_HEIGHT, 0, 0]
      });
    } else {
      return this.state.yValues[activeIndex].interpolate({
        inputRange: [
          -SCREEN_HEIGHT,
          nonReactiveDistance,
          swappingDistance,
          SCREEN_HEIGHT
        ],
        outputRange: [0, 0, -ITEM_HEIGHT, -ITEM_HEIGHT]
      });
    }
  };

  renderItem = ({ item: { title }, index }) => {
    return (
      <PanGestureHandler
        onGestureEvent={this.onGestureEvent(index)}
        onHandlerStateChange={this.onHandlerStateChange(index)}
      >
        <Animated.View>
          <Animated.View
            style={[
              styles.item,
              {
                transform: [
                  {
                    translateY: this.getTranslateY(index)
                  }
                ]
              }
            ]}
          >
            <Text>{title}</Text>
            <Handle />
          </Animated.View>
        </Animated.View>
      </PanGestureHandler>
    );
  };

  render() {
    const { data, activeIndex } = this.state;

    return (
      <SafeAreaView style={styles.container}>
        <FlatList
          data={data}
          extraData={activeIndex}
          keyExtractor={item => item.title}
          renderItem={this.renderItem}
          style={styles.list}
          bounces={false}
        />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  list: {
    flex: 1
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 40,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#000"
  },
  handleContainer: {
    alignItems: "flex-end",
    paddingRight: 24
  },
  handle: {
    width: 40,
    height: 20,
    justifyContent: "space-between"
  },
  handleLine: {
    height: 1,
    backgroundColor: "#000"
  }
});

export default gestureHandlerRootHOC(App);
