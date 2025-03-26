<template>
  <div class="macro-list-container">
    <h3>宏列表</h3>
    <div class="macro-list">
      <div class="macro" v-for="(ite, idx) in demoMacroData" :key="idx">
        <h4>{{ ite.name + (idx + 1) }}</h4>
        <p class="create-time">创建时间: {{ formatTimestamp(ite.time) }}</p>
        <p class="length">操作长度: {{ ite.length }}</p>
        <div class="controls-group" @click="handleOperation">
          <span class="copy-btn">复制</span>
          <span class="del-btn">删除</span>
        </div>
      </div>
      <template v-if="demoMacroData.length > 0">
        <div class="add-macro">
          <div>
            <span></span>
            新建宏
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
const demoMacroData = [
  {
    name: '宏',
    time: Date.now(),
    data: [
      {
        type: 'key', // 按键类型/延时类型
        key: 'keyVal',
        status: 'up', // 按下/抬起(type为delay时为空)
        delay: 200,
      },
    ],
    length: 1,
  },
  {
    name: '宏',
    time: Date.now(),
    data: [
      {
        type: 'key', // 按键类型/延时类型
        key: 'keyVal',
        status: 'up', // 按下/抬起(type为delay时为空)
        delay: 200,
      },
    ],
    length: 1,
  },
  {
    name: '宏',
    time: Date.now(),
    data: [
      {
        type: 'key', // 按键类型/延时类型
        key: 'keyVal',
        status: 'up', // 按下/抬起(type为delay时为空)
        delay: 200,
      },
    ],
    length: 1,
  },
  {
    name: '宏',
    time: Date.now(),
    data: [
      {
        type: 'key', // 按键类型/延时类型
        key: 'keyVal',
        status: 'up', // 按下/抬起(type为delay时为空)
        delay: 200,
      },
    ],
    length: 1,
  },
  {
    name: '宏',
    time: Date.now(),
    data: [
      {
        type: 'key', // 按键类型/延时类型
        key: 'keyVal',
        status: 'up', // 按下/抬起(type为delay时为空)
        delay: 200,
      },
    ],
    length: 1,
  },
  {
    name: '宏',
    time: Date.now(),
    data: [
      {
        type: 'key', // 按键类型/延时类型
        key: 'keyVal',
        status: 'up', // 按下/抬起(type为delay时为空)
        delay: 200,
      },
    ],
    length: 1,
  },
];

const formatTimestamp = (timestamp) => {
  // 创建一个 Date 对象
  const date = new Date(timestamp);

  // 获取年、月、日、小时和分钟
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 月份从0开始，需要加1
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();

  // 格式化时间为 YYYY.M.D-HH:mm 的形式
  const formattedDate = `${year}.${month}.${day}-${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

  return formattedDate;
};

const handleOperation = (event) => {
  if (event.target.className === 'del-btn') {
    console.log('del');
  } else if (event.target.className === 'copy-btn') {
    console.log('copy');
  }
};
</script>

<style scoped lang="scss">
.macro-list-container {
  width: 300px;
  height: 756px;
  box-sizing: border-box;
  background-color: #000;
  border: 3px solid #202020;
  border-radius: 15px;

  h3 {
    margin: 25px 0 34px 30px;
    line-height: 1;
    color: #fff;
    font-size: 16px;
    font-family: 'CN Heavy';
  }

  .macro-list {
    height: 100%;
    box-sizing: border-box;
    padding-right: 5px;
    padding-bottom: 90px;
    overflow-y: scroll;

    &::-webkit-scrollbar {
      height: 10px;
      width: 5px;
    }

    /* 滚动条轨道 */
    &::-webkit-scrollbar-track {
      background: transparent;
    }

    /* 滚动条手柄 */
    &::-webkit-scrollbar-thumb {
      background: rgb(37, 37, 37);
    }

    /* 隐藏滚动条 */
    &::-webkit-scrollbar {
      display: none;
    }

    /* 当容器被悬停时显示滚动条 */
    &:hover::-webkit-scrollbar {
      display: block;
    }
    .macro {
      width: 250px;
      height: 150px;
      margin: 0 0 20px 25px;
      box-sizing: border-box;
      color: #fff;
      background-color: #000;
      border: 3px solid #202020;
      border-radius: 15px;
      display: flex;
      flex-direction: column;
      align-items: center;

      h4 {
        margin: 20px 0 15px 0;
        line-height: 1;
        color: #fff;
        font-size: 16px;
        font-family: 'CN Heavy';
      }

      p {
        font-size: 10px;
      }

      .length {
        margin: 10px 0 15px 0;
      }

      .controls-group {
        width: 140px;
        display: flex;
        align-items: center;
        justify-content: space-between;

        span {
          width: 60px;
          height: 20px;
          color: #000;
          font-size: 12px;
          font-family: 'CN Heavy';
          line-height: 20px;
          text-align: center;
          vertical-align: middle;
          border-radius: 5px;
          cursor: pointer;
        }

        .copy-btn {
          background-color: #91bc00;
        }
        .del-btn {
          background-color: #ff0000;
        }
      }
    }

    .add-macro {
      width: 250px;
      height: 150px;
      margin-left: 25px;
      box-sizing: border-box;
      color: #fff;
      background-color: #000;
      border: 3px solid #202020;
      border-radius: 15px;
      display: flex;
      align-items: center;
      justify-content: center;

      div {
        width: 200px;
        height: 30px;
        color: #fff;
        font-size: 16px;
        font-family: 'CN Heavy';
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #000;
        border-radius: 20px;
        cursor: pointer;
        &:hover {
          background-color: #91bc00;
          color: #000;
        }

        span {
          width: 14px;
          height: 14px;
          margin-right: 10px;
          background-image: url('@/assets/images/add_w.svg');
          background-size: cover;
          background-repeat: no-repeat;
          &:hover {
            background-image: url('@/assets/images/add.svg');
          }
        }
      }
    }
  }
}
</style>
