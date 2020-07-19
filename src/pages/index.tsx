import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Alert, Row, Col, message } from 'antd';
import './index.scss';

const grid = 8;
export default class App extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      // 待选的四组数
      group1: this.getOneGroupNumber(),
      group2: this.getOneGroupNumber(),
      group3: this.getOneGroupNumber(),
      group4: this.getOneGroupNumber(),

      // 用户选择
      selected0: [],
      selected1: [],

      turns: 0, // 0表示 A 玩家，1表示 B 玩家
    };
  }

  onDragEnd = result => {
    const { turns } = this.state;
    const { source, destination } = result;
    // dropped outside the list
    if (!destination) {
      return;
    }
    // 移动到当前行
    if (source.droppableId === destination.droppableId) {
      return;
    }
    // 目标是池子
    if (destination.droppableId.split('_')[0] === 'poll') {
      return;
    }
    // 开始是池子
    if (source.droppableId.split('_')[0] === 'userResultPanel') {
      return;
    }
    // 移到别人面板下
    if (destination.droppableId.split('_')[1] !== turns.toString()) {
      return;
    }

    let idxPoll = source.droppableId.split('_')[1];
    let idxUserResultPanel = destination.droppableId.split('_')[1];
    let group = this.state[`group${idxPoll}`].filter(
      (item, index) => index !== source.index,
    );
    // let selected =

    const sourceClone = Array.from(this.state[`group${idxPoll}`]);
    const destClone = Array.from(this.state[`selected${idxUserResultPanel}`]);

    const [removed] = sourceClone.splice(source.index, 1);
    destClone.splice(destination.index, 0, removed);

    this.setState(
      {
        [`group${idxPoll}`]: sourceClone,
        [`selected${idxUserResultPanel}`]: destClone,
        turns: (turns + 1) % 2,
      },
      () => {
        let sumA = this.getArraySum(this.state.selected0);
        let sumB = this.getArraySum(this.state.selected1);

        if (sumA + sumB === 31) {
          message.success('游戏结束', 0);
        }
        if (sumA + sumB > 31) {
          message.error('爆掉了', 0);
        }
      },
    );
  };

  getListStyle = isDraggingOver => ({
    background: isDraggingOver ? 'lightblue' : 'lightgrey',
    display: 'flex',
    padding: grid,
    overflow: 'auto',
  });

  getItemStyle = (isDragging, draggableStyle) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: 'none',
    // padding: grid * 2,
    margin: `0 ${grid}px 0 0`,
    width: '50px',
    height: '50px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',

    // change background colour if dragging
    background: isDragging ? 'lightgreen' : 'grey',

    // styles we need to apply on draggables
    ...draggableStyle,
  });

  // 获取一组数
  getOneGroupNumber = () => new Array(6).fill(0).map((_, index) => index + 1);

  getArraySum = arr => arr.reduce((acc, cur) => acc + cur, 0);

  render() {
    const {
      group1,
      group2,
      group3,
      group4,
      selected0,
      selected1,
      turns,
    } = this.state;
    // 待选池
    const polls = [group1, group2, group3, group4];
    const selections = [selected0, selected1];

    return (
      <div className="indexWrapper">
        {/* 游戏介绍 */}
        <Alert
          message="游戏玩法：双方玩家轮流从数字区域选择数字放入自己区域，率先使两者区域数字之和等于31的玩家获胜"
          type="info"
          showIcon
          className="introduction"
        />

        {/* 公共数字区域 */}
        <DragDropContext onDragEnd={this.onDragEnd}>
          <Row gutter={24} style={{ marginTop: 20 }}>
            <Col span={12}>
              {polls.map((poll, index) => (
                <Droppable
                  droppableId={`poll_${index + 1}`}
                  direction="horizontal"
                  key={`poll_${index + 1}`}
                >
                  {(provided: any, snapshot: any) => (
                    <div
                      ref={provided.innerRef}
                      style={this.getListStyle(snapshot.isDraggingOver)}
                      {...provided.droppableProps}
                    >
                      {poll.map((item, subindex) => (
                        <Draggable
                          key={`poll_${index}_${item}`}
                          draggableId={`poll_${index}_${item}`}
                          index={subindex}
                        >
                          {(provided: any, snapshot: any) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={this.getItemStyle(
                                snapshot.isDragging,
                                provided.draggableProps.style,
                              )}
                            >
                              {item}
                            </div>
                          )}
                        </Draggable>
                      ))}
                    </div>
                  )}
                </Droppable>
              ))}
            </Col>
            <Col span={12}>
              <div>当前玩家: {turns ? 'B' : 'A'}</div>
              <div>
                数据总和：
                {this.getArraySum(selected0) + this.getArraySum(selected1)}
              </div>
            </Col>
          </Row>

          <Row className="userResultPanel" gutter={24}>
            {selections.map((select, index) => (
              <Col span={12} key={index}>
                <Droppable
                  droppableId={`userResultPanel_${index}`}
                  direction="horizontal"
                >
                  {(provided: any, snapshot: any) => (
                    <div
                      ref={provided.innerRef}
                      style={{
                        ...this.getListStyle(snapshot.isDraggingOver),
                        height: '100%',
                      }}
                    >
                      {select.map((item: number, index: number) => (
                        <Draggable
                          key={`userResultPanel_${index}_${item}`}
                          draggableId={`userResultPanel_${index}_${item}`}
                          index={index}
                        >
                          {(provided: any, snapshot: any) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={this.getItemStyle(
                                snapshot.isDragging,
                                provided.draggableProps.style,
                              )}
                            >
                              {item}
                            </div>
                          )}
                        </Draggable>
                      ))}
                    </div>
                  )}
                </Droppable>
              </Col>
            ))}
          </Row>
        </DragDropContext>
      </div>
    );
  }
}
