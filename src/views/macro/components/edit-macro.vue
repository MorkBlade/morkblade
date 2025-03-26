<template>
  <div class="edit-macro-container">
    <h3>宏列表</h3>
    <div class="drag-container">
      <draggable
        v-model="demoMacroData"
        handle=".handle"
        :force-fallback="true"
        :animation="300"
        @start="drag = true"
        @end="drag = false"
      >
        <template #item="{ element }">
          <div class="drag-item">
            <div :class="element.type === 'key' ? 'key' : 'delay'">
              <img class="handle" src="@/assets/images/header_icon.svg" alt="" />
              <div class="content">
                <img :src="element.status === 'up' ? keyupIcon : keydownIcon" alt="" v-if="element.type === 'key'" />
                <span :class="element.type === 'key' ? 'keyVal' : 'delayVal'">
                  {{ element.type === 'key' ? element.key : element.delay + 'ms' }}
                </span>
                <img class="copy-icon" src="@/assets/images/copy_icon.svg" alt="" />
                <img class="del-icon" src="@/assets/images/del_btn.svg" alt="" />
              </div>
            </div>
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>

<script setup>
import draggable from 'vuedraggable';

const drag = ref(false);
const demoMacroData = ref([
  {
    type: 'key',
    key: 'Space',
    status: 'up',
    delay: 200,
  },
  {
    type: 'delay',
    key: '',
    status: '',
    delay: 200,
  },
  {
    type: 'key',
    key: 'k',
    status: 'up',
    delay: 200,
  },
  {
    type: 'delay',
    key: '',
    status: '',
    delay: 200,
  },
  {
    type: 'key',
    key: 'k',
    status: 'up',
    delay: 200,
  },
  {
    type: 'delay',
    key: '',
    status: '',
    delay: 200,
  },
  {
    type: 'key',
    key: 'k',
    status: 'up',
    delay: 200,
  },
  {
    type: 'delay',
    key: '',
    status: '',
    delay: 200,
  },
  {
    type: 'key',
    key: 'k',
    status: 'up',
    delay: 200,
  },
  {
    type: 'delay',
    key: '',
    status: '',
    delay: 200,
  },
  {
    type: 'key',
    key: 'k',
    status: 'up',
    delay: 200,
  },
  {
    type: 'delay',
    key: '',
    status: '',
    delay: 200,
  },
]);
</script>

<style scoped lang="scss">
.edit-macro-container {
  width: 960px;
  height: 756px;
  box-sizing: border-box;
  background-color: #000;
  border: 3px solid #202020;
  border-radius: 15px;
  margin: 0 20px;
  position: relative;

  h3 {
    margin: 25px 0 34px 30px;
    line-height: 1;
    color: #fff;
    font-size: 16px;
    font-family: 'CN Heavy';
  }

  .drag-container {
    width: 100%;
    height: 510px;
    box-sizing: border-box;
    padding-right: 5px;
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

    .drag-item {
      width: 940px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      .key,
      .delay {
        display: flex;
        box-sizing: border-box;
        border-radius: 30px;
        margin-bottom: 15px;
        border: 3px solid #202020;
        background-color: #000;
        transition: transform 0.3s ease-in-out;
        cursor: pointer;

        &:hover {
          border-color: #91bc00;
        }

        & .handle {
          width: 54px;
          height: 48px;
          object-fit: fill;
          background-color: #91bc00;
          margin: -2px 0 0 -2px;
          border-radius: 30px 0 0 30px;
        }

        .content {
          width: 100%;
          height: 100%;
          color: #fff;
          font-size: 20px;
          font-family: 'CN Heavy';
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;

          & img {
            width: 16px;
            height: 16px;
            object-fit: fill;
          }

          .keyVal {
            width: 30px;
            height: 30px;
            border: 2px solid #fff;
            border-radius: 5px;
            margin-left: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .copy-icon {
            width: 20px;
            height: 20px;
            position: absolute;
            right: 70px;
          }
          .del-icon {
            width: 20px;
            height: 20px;
            position: absolute;
            right: 30px;
          }
        }
      }
      .key {
        width: 860px;
        height: 50px;
      }

      .delay {
        width: 430px;
        height: 50px;
      }
    }
  }
}
</style>
