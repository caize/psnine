import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ToastAndroid,
  BackHandler,
  Dimensions,
  TouchableNativeFeedback,
  KeyboardAvoidingView,
  InteractionManager,
  Keyboard,
  TextInput,
  Animated,
  Easing,
  PanResponder,
  StatusBar,
  Picker,
  Button
} from 'react-native';

import { connect } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { standardColor, accentColor } from '../../constants/colorConfig';

import { pngPrefix, getDealURL, getHappyPlusOneURL, getStoreURL } from '../../dao';

import { safeLogin, registURL } from '../../dao/login';
import { postCreateTopic } from '../../dao/post';
import HTMLView from '../../components/HtmlToView'
import MyDialog from '../../components/Dialog'
import Emotion from '../../components/Emotion'

let title = '创建基因';

let toolbarActions = [

];

let AnimatedKeyboardAvoidingView = Animated.createAnimatedComponent(KeyboardAvoidingView);

let screen = Dimensions.get('window');

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = screen;

SCREEN_HEIGHT = SCREEN_HEIGHT - StatusBar.currentHeight + 1;

let CIRCLE_SIZE = 56;

const emotionToolbarHeight = 190

let config = { tension: 30, friction: 7, ease: Easing.in(Easing.ease(1, 0, 1, 1)), duration: 200 };

export default class NewTopic extends Component {

  constructor(props) {
    super(props);
    const { params } = this.props.navigation.state
    const { at = '', shouldShowPoint = false, isOldPage = false } = params
    // console.log(params)
    this.state = {
      icon: false,
      content: '',
      photo: [],
      url: '',
      groupid: params.groupid || '-1',
      addgene: '',
      openVal: new Animated.Value(0),
      marginTop: new Animated.Value(0),
      toolbarOpenVal: new Animated.Value(0),
      modalVisible: false,
      selection: {}
    }
  }

  componentDidMount = () => {
    const { modeInfo } = this.props.screenProps
    let config = { tension: 30, friction: 7 };
    Animated.spring(this.state.openVal, { toValue: 1, ...config }).start(() => {
      if (modeInfo.settingInfo.psnid === '') {
        toast('请首先登录')
        this.props.navigation.goBack()
        return
      }
    });
  }

  _pressButton = (callback) => {
    const { marginTop, openVal } = this.state
    let value = marginTop._value;
    if (Math.abs(value) >= 50) {
      Animated.spring(marginTop, { toValue: 0, ...config }).start();
      return true;
    } 
    this.content.clear();
    Keyboard.dismiss()
    Animated.spring(openVal, { toValue: 0, ...config }).start(() => {
      typeof callback === 'function' && callback()
      this.props.navigation.goBack()
    });

  }

  isKeyboardShowing = false
  _pressEmotion = () => {
    let config = { tension: 30, friction: 7 };
    const target = this.state.toolbarOpenVal._value === 1 ? 0 : 1
    if (target === 1 && this.isKeyboardShowing === true) {
      this.shouldShowEmotion = true
      Keyboard.dismiss()
      return
    }
    Animated.spring(this.state.toolbarOpenVal, { toValue: target, ...config }).start();
  }

  componentWillUnmount = () => {
    this.keyboardDidHideListener.remove();
    this.keyboardDidShowListener.remove();
    this.removeListener && this.removeListener.remove()
  }

  componentWillMount = async () => {
    let config = { tension: 30, friction: 7 };
    const { openVal, marginTop } = this.state
    const { callback } = this.props.navigation.state.params
    const { params } = this.props.navigation.state
    const { modeInfo } = this.props.screenProps

    this.PanResponder = PanResponder.create({

      onStartShouldSetPanResponderCapture: (e, gesture) => {
        return e.nativeEvent.pageX <= 56 ? false : true;
      },
      onPanResponderGrant: (e, gesture) => {
        Keyboard.dismiss()
        const target = gesture.y0 <= 56 ? 0 : SCREEN_HEIGHT - 56
        marginTop.setOffset(target);
      },
      onPanResponderMove: Animated.event([
        null,
        {
          dy: marginTop
        }
      ]),

      onPanResponderRelease: (e, gesture) => {

      },
      onPanResponderTerminationRequest: (evt, gesture) => {
        return false;
      },
      onPanResponderTerminate: (evt, gesture) => {

      },
      onShouldBlockNativeResponder: (evt, gesture) => {
        return true;
      },
      onPanResponderReject: (evt, gesture) => {
        return false;
      },
      onPanResponderEnd: (evt, gesture) => {
        let dy = gesture.dy;
        let vy = gesture.vy;

        marginTop.flattenOffset();

        let duration = 50;

        if (vy < 0) {

          if (Math.abs(dy) <= CIRCLE_SIZE) {

            Animated.spring(marginTop, {
              toValue: SCREEN_HEIGHT - CIRCLE_SIZE,
              duration,
              easing: Easing.linear,
            }).start();

          } else {

            Animated.spring(marginTop, {
              toValue: 0,
              duration,
              easing: Easing.linear,
            }).start();

          }

        } else {

          if (Math.abs(dy) <= CIRCLE_SIZE) {

            Animated.spring(marginTop, {
              toValue: 0,
              duration,
              easing: Easing.linear,
            }).start();

          } else {

            Animated.spring(marginTop, {
              toValue: SCREEN_HEIGHT - CIRCLE_SIZE,
              duration,
              easing: Easing.linear,
            }).start();
          }

        }

      },

    });
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      this.isKeyboardShowing = true
      this.state.toolbarOpenVal.setValue(0)
    })
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      this.isKeyboardShowing = false
      this.shouldShowEmotion === true && Animated.spring(this.state.toolbarOpenVal, {
        toValue: 1,
        friction: 10
      }).start(() => {
        this.shouldShowEmotion = false
      });
    })
    this.isToolbarShowing = false
    // this.removeListener = BackHandler.addEventListener('hardwareBackPress', () => {
    //   let config = { tension: 30, friction: 7 };
    //   if (this.state.toolbarOpenVal._value !== 0) {
    //     Animated.spring(this.state.toolbarOpenVal, { toValue: 0, ...config }).start();
    //     return true;
    //   }
    //   let value = this.state.marginTop._value
    //   if (Math.abs(value) >= 50) {
    //     Animated.spring(marginTop, { toValue: 0, ...config }).start();
    //     return true;
    //   } else {
    //     Keyboard.dismiss()
    //     Animated.spring(openVal, { toValue: 0, ...config }).start(() => {
    //       this.props.navigation.goBack()
    //     });
    //     return true
    //   }
    // })

    const icon = await Promise.all([
      Ionicons.getImageSource('md-arrow-back', 20, '#fff'),
      Ionicons.getImageSource('md-happy', 50, '#fff'),
      Ionicons.getImageSource('md-photos', 50, '#fff'),
      Ionicons.getImageSource('md-send', 50, '#fff'),
      Ionicons.getImageSource('md-eye', 50, '#fff'),
    ])
    this.setState({
      icon: {
        backIcon: icon[0],
        emotionIcon: icon[1],
        photoIcon: icon[2],
        sendIcon: icon[3],
        previewIcon: icon[4]
      }
    })

  }

  sendReply = () => {
    // console.log({
    //   content: this.state.content,
    //   photo: this.state.photo.join(','),
    //   url: this.state.url,
    //   groupid: this.state.groupid,
    //   addgene: this.state.addgene
    // })
    // return
    postCreateTopic({
      content: this.state.content,
      photo: this.state.photo.join(','),
      url: this.state.url,
      groupid: this.state.groupid,
      addgene: this.state.addgene
    }, 'gene').then(res => {
      return res
    }).then(res => res.text()).then(text => {
      // console.log(text)
      if (text.includes('玩脱了')) {
        const arr = text.match(/\<title\>(.*?)\<\/title\>/)
        if (arr && arr[1]) {
          const msg = `发布失败: ${arr[1]}`
          // ToastAndroid.show(msg, ToastAndroid.SHORT);
          global.toast(msg)
          return
        }
      }
      InteractionManager.runAfterInteractions(() => {
        // ToastAndroid.show('评论成功', ToastAndroid.SHORT);
        // global.toast('评论成功')
        this._pressButton()
        // this._pressButton(() => params.callback && params.callback())
        global.toast('发布成功')
      })
    }).catch(err => {
      const msg = `发布失败: ${arr[1]}`
      global.toast(msg)
      // ToastAndroid.show(msg, ToastAndroid.SHORT);
    })
  }

  onValueChange = (key: string, value: string) => {
    const newState = {};
    newState[key] = value;
    this.setState(newState, () => {
      // this._onRefresh()
    });
  };

  render() {
    let { openVal, marginTop } = this.state;
    const { icon, toolbarOpenVal } = this.state
    const { modeInfo } = this.props.screenProps
    let outerStyle = {
      marginTop: marginTop.interpolate({
        inputRange: [0, SCREEN_HEIGHT],
        outputRange: [0, SCREEN_HEIGHT]
      })
    };

    let animatedStyle = {
      left: openVal.interpolate({ inputRange: [0, 1], outputRange: [SCREEN_WIDTH - 56 - 16, 0] }),
      top: openVal.interpolate({ inputRange: [0, 1], outputRange: [SCREEN_HEIGHT - 16 - 56, 0] }),
      width: openVal.interpolate({ inputRange: [0, 1], outputRange: [CIRCLE_SIZE, SCREEN_WIDTH] }),
      height: openVal.interpolate({ inputRange: [0, 1], outputRange: [CIRCLE_SIZE, SCREEN_HEIGHT + 100] }),
      borderWidth: openVal.interpolate({ inputRange: [0, 0.5, 1], outputRange: [2, 2, 0] }),
      borderRadius: openVal.interpolate({ inputRange: [-0.15, 0, 0.5, 1], outputRange: [0, CIRCLE_SIZE / 2, CIRCLE_SIZE * 1.3, 0] }),
      opacity: openVal.interpolate({ inputRange: [0, 0.1, 1], outputRange: [0, 1, 1] }),
      zIndex: openVal.interpolate({ inputRange: [0, 1], outputRange: [0, 3] }),
      backgroundColor: openVal.interpolate({
        inputRange: [0, 1],
        outputRange: [accentColor, modeInfo.backgroundColor]
      }),
      //elevation : openVal.interpolate({inputRange: [0 ,1], outputRange: [0, 8]})
    };

    let animatedSubmitStyle = {
      height: openVal.interpolate({ inputRange: [0, 0.9, 1], outputRange: [0, 0, 40] }),
    }

    let animatedToolbarStyle = {
      height: openVal.interpolate({ inputRange: [0, 0.9, 1], outputRange: [0, 0, 56] }),
      backgroundColor: modeInfo.standardColor,
    }

    return (
      <Animated.View
        ref={ref => this.ref = ref}
        style={[
          styles.circle, styles.open, animatedStyle, outerStyle
        ]}

      >
        <Animated.View {...this.PanResponder.panHandlers} style={[styles.toolbar, animatedToolbarStyle]}>
          <View style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <TouchableNativeFeedback
              onPress={this._pressButton}
              delayPressIn={0}
              background={TouchableNativeFeedback.SelectableBackgroundBorderless()}
              style={{ borderRadius: 25 }}
            >
              <View style={{ width: 50, height: 50, marginLeft: 0, borderRadius: 25 }}>
                {icon && <Image
                  source={icon.backIcon}
                  style={{ width: 20, height: 20, marginTop: 15, marginLeft: 15 }}
                />}
              </View>
            </TouchableNativeFeedback>
            <Text style={{ color: 'white', fontSize: 23, marginLeft: 10, }}>{title}</Text>
          </View>

        </Animated.View >

        <Animated.View style={[styles.KeyboardAvoidingView, {
          flex: openVal.interpolate({ inputRange: [0, 1], outputRange: [0, 10] }),
        }]} >
          <AnimatedKeyboardAvoidingView behavior={'padding'} style={[styles.contentView, {
            flex: openVal.interpolate({ inputRange: [0, 1], outputRange: [0, 12] }),
          }]}>
            <TextInput placeholder="请说说你对这些图/音乐/视频/电影的感受和看法，不要超过600字哦"
              autoCorrect={false}
              multiline={true}
              keyboardType="default"
              returnKeyType='go'
              returnKeyLabel='go'
              onSelectionChange={this.onSelectionChange}
              blurOnSubmit={true}
              numberOfLines={100}
              ref={ref => this.content = ref}
              onChange={({ nativeEvent }) => { this.setState({ content: nativeEvent.text }) }}
              value={this.state.content}
              style={[styles.textInput, {
                color: modeInfo.titleTextColor,
                textAlign: 'left',
                textAlignVertical: 'top',
                flex: 20,
              }]}
              placeholderTextColor={modeInfo.standardTextColor}
              // underlineColorAndroid={accentColor}
              underlineColorAndroid='rgba(0,0,0,0)'
            />
            <Button style={{flex:1, padding: 5, margin: 5}} title={'点我选择图片(已选择' + this.state.photo.length + '张)'} onPress={() => {
              Keyboard.dismiss()
              this.props.navigation.navigate('UserPhoto', {
                URL: 'http://psnine.com/my/photo?page=1',
                type: 'multi',
                selections: this.state.photo,
                callbackAfterAll: (imageArr) => {
                  this.setState({
                    photo: imageArr
                  })
                }
              })
            }} color={modeInfo.standardColor}/>
            <TextInput placeholder="选填项，内容可以带一个链接地址，http://开头哦"
              autoCorrect={false}
              multiline={false}
              keyboardType="default"
              returnKeyType="next"
              returnKeyLabel='next'
              onSelectionChange={this.onSelectionChange}
              blurOnSubmit={false}
              numberOfLines={1}
              ref={ref => this.url = ref}
              onChange={({ nativeEvent }) => { this.setState({ url: nativeEvent.text }) }}
              value={this.state.url}
              style={[styles.textInput, {
                color: modeInfo.titleTextColor,
                textAlign: 'left',
                height: 56,
                /*flex: 0,*/
                borderBottomColor: modeInfo.brighterLevelOne,
                borderBottomWidth: StyleSheet.hairlineWidth
              }]}
              placeholderTextColor={modeInfo.standardTextColor}
              // underlineColorAndroid={accentColor}
              underlineColorAndroid='rgba(0,0,0,0)'
            />
            <Animated.View style={[{
              elevation: 4,
              bottom: 0 //toolbarOpenVal.interpolate({ inputRange: [0, 1], outputRange: [0, 1] })
            }, animatedToolbarStyle]}>
              <View style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <View style={{ flexDirection: 'row', }}>
                  <TouchableNativeFeedback
                    onPress={this._pressEmotion}
                    delayPressIn={0}
                    background={TouchableNativeFeedback.SelectableBackgroundBorderless()}
                    style={{ borderRadius: 25 }}
                  >
                    <View style={{ width: 50, height: 50, marginLeft: 0, borderRadius: 25 }}>
                      {icon && <Image
                        source={icon.emotionIcon}
                        style={{ width: 25, height: 25, marginTop: 12.5, marginLeft: 12.5 }}
                      />}
                    </View>
                  </TouchableNativeFeedback>
                  <TouchableNativeFeedback
                    onPress={this._pressImageButton}
                    delayPressIn={0}
                    background={TouchableNativeFeedback.SelectableBackgroundBorderless()}
                    style={{ borderRadius: 25 }}
                  >
                    <View style={{ width: 50, height: 50, marginLeft: 0, borderRadius: 25, }}>
                      {icon && <Image
                        source={icon.photoIcon}
                        style={{ width: 25, height: 25, marginTop: 12.5, marginLeft: 12.5 }}
                      />}
                    </View>
                  </TouchableNativeFeedback>
                </View>
                <TouchableNativeFeedback
                  onPress={() => {
                    this.setState({
                      modalVisible: true
                    })
                  }}
                  delayPressIn={0}
                  background={TouchableNativeFeedback.SelectableBackgroundBorderless()}
                  style={{ borderRadius: 25 }}
                >
                  <View style={{ width: 50, height: 50, marginLeft: 0, borderRadius: 25, }}>
                    {icon && <Image
                      source={icon.previewIcon}
                      style={{ width: 25, height: 25, marginTop: 12.5, marginLeft: 12.5 }}
                    />}
                  </View>
                </TouchableNativeFeedback>
                <TouchableNativeFeedback
                  onPress={this.sendReply}
                  delayPressIn={0}
                  background={TouchableNativeFeedback.SelectableBackgroundBorderless()}
                  style={{ borderRadius: 25 }}
                >
                  <View style={{ width: 50, height: 50, marginLeft: 0, borderRadius: 25, }}>
                    {icon && <Image
                      source={icon.sendIcon}
                      style={{ width: 25, height: 25, marginTop: 12.5, marginLeft: 12.5 }}
                    />}
                  </View>
                </TouchableNativeFeedback>
              </View>
            </Animated.View>
            {
              this.state.modalVisible && (
                <MyDialog modeInfo={modeInfo}
                  modalVisible={this.state.modalVisible}
                  onDismiss={() => { this.setState({ modalVisible: false }); this.isValueChanged = false }}
                  onRequestClose={() => { this.setState({ modalVisible: false }); this.isValueChanged = false }}
                  renderContent={() => (
                    <View style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: modeInfo.backgroundColor,
                      paddingVertical: 10,
                      paddingHorizontal: 10,
                      elevation: 4,
                      position: 'absolute',
                      left: 20,
                      right: 20,
                      opacity: 1
                    }} borderRadius={2}>
                      <HTMLView
                        value={this.state.content || '暂无内容'}
                        modeInfo={modeInfo}
                        stylesheet={styles}
                        onImageLongPress={(url) => this.props.navigation.navigate('ImageViewer', {
                          images: [
                            { url }
                          ]
                        })}
                        imagePaddingOffset={60}
                        shouldForceInline={true}
                      />
                    </View>
                  )} />
              )
            }
            {/* 表情 */}
            <Animated.View style={{
              elevation: 4,
              bottom: 0, //toolbarOpenVal.interpolate({ inputRange: [0, 1], outputRange: [0, 100] }),
              backgroundColor: modeInfo.standardColor,
              height: toolbarOpenVal.interpolate({ inputRange: [-1, 0, 1], outputRange: [0, 0, emotionToolbarHeight] }),
              opacity: openVal.interpolate({ inputRange: [0, 0.9, 1], outputRange: [0, 0, 1] }),
            }} >
              <Emotion
                modeInfo={modeInfo}
                onPress={this.onPressEmotion}
              />
            </Animated.View>
            <Animated.View style={{
              elevation: 4, 
              bottom: 0, 
              backgroundColor: modeInfo.standardColor,
              height: 100,
              opacity: openVal.interpolate({ inputRange: [0, 0.9, 1], outputRange: [0, 0, 1] }),
            }} />
          </AnimatedKeyboardAvoidingView>

        </Animated.View>

      </Animated.View>
    );
  }

  onPressEmotion = ({ text, url }) => {
    this.addText(
      `[img]${url}[/img]`
    )
  }

  addText = (text) => {
    const origin = this.state.content
    let { start = 0, end = 0 } = this.state.selection
    if (start !== end) {
      const exist = origin.slice(start, end)
      text = text.slice(0, start) + exist + text.slice(end)
      end = start + exist.length
    }
    let input = origin.slice(0, start) + text + origin.slice(end)
    this.setState({
      content: input,
      selection: { start, end }
    })
  }

  onSelectionChange = ({ nativeEvent }) => {
    // console.log(nativeEvent.selection)
    this.setState({
      selection: nativeEvent.selection
    })
  }


  _pressImageButton = (callback) => {
    const { params } = this.props.navigation.state
    Keyboard.dismiss()
    this.props.navigation.navigate('UserPhoto', {
      URL: 'http://psnine.com/my/photo?page=1',
      callback: ({ url }) => {
        this.addText(`[img]${url}[/img]`)
      }
    })
  }
}


const width = Dimensions.get('window').width;

const styles = StyleSheet.create({
  circle: {
    flex: 1,
    position: 'absolute',
    backgroundColor: 'white',
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 2,
    borderColor: accentColor,
    elevation: 12,
  },
  open: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    width: undefined, // unset value from styles.circle
    height: undefined, // unset value from styles.circle
    borderRadius: CIRCLE_SIZE / 2, // unset value from styles.circle
  },
  toolbar: {
    backgroundColor: standardColor,
    height: 56,
    elevation: 4,
    flex: -1,
  },
  mainFont: {
    fontSize: 15,
    color: accentColor
  },
  textInput: {
    fontSize: 15,
  },
  KeyboardAvoidingView: {
    flex: 10,
    // width: width,
    //alignSelf:'center',
    //justifyContent: 'space-between',
    flexDirection: 'column'
  },
  titleView: {
    flex: 1,
    //marginTop: -10,
    justifyContent: 'center',
    // flexDirection: 'column',
    // justifyContent: 'space-between',
  },
  isPublicView: {
    flex: 1,
    flexDirection: 'row',
    // flexDirection: 'column',
    alignItems: 'center',
  },
  contentView: {
    flex: 12,
    // flexDirection: 'column', 
  },
  submit: {
    // flex: -1, 
    // height: 20,
    // //margin: 10,
    // marginTop: 30,
    // marginBottom: 20,
  },
  submitButton: {
    // backgroundColor: accentColor,
    // height: 40,
    // alignItems: 'center',
    // justifyContent: 'center',
  },
  regist: {
    flex: 1,
    flexDirection: 'row',
    marginTop: 20,
    margin: 10,
  },
  openURL: {
    color: accentColor,
    textDecorationLine: 'underline',
  },
})