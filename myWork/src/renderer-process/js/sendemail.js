let nodemailer = require('nodemailer');
let fs = require('fs');

(function () {
    let data = {
        isSending: false,
        threading: 2
    }
    let transporter = nodemailer.createTransport({
        pool: true,
        host: 'smtp.qq.com',
        port: 465,
        srcure: true,
        auth: {
            user: 'wsx1887@qq.com',
            pass: 'lqosoxejsxjjbeaf'
        }
    });
    //"发送邮件"按钮的单击事件处理
    document.getElementById('sendemail').addEventListener('click', async function sendemailArray(event) {
        let imgsArray = document.getElementById('imgs-list').value.split("\n").filter(item => item.trim().length > 0);
        let attachmentArray = document.getElementById('attachments-list').value.split("\n").filter(item => item.trim().length > 0);
        let basepath = document.getElementById('path').value.replace(/\\/g, "/");
        if (basepath[basepath.length - 1] != "/") {
            basepath += "/";
        }
        let sendMessageArray = [];
        for (let i = 0; i < attachmentArray.length; i++) {
            let message = JSON.parse(JSON.stringify(messageModel));
            message.subject = attachmentArray[i];
            message.attachments[0] = {
                path: basepath + attachmentArray[i]
            };
            if (imgsArray.length > 0) {
                //图片比附件少时轮流使用图片
                let n = i;
                while (n > imgsArray.length - 1) {
                    n -= imgsArray.length;
                }
                message.html = `<img src="cid:${i}"/>`;
                message.attachments[1] = {
                    path: basepath + imgsArray[n],
                    cid: i + ''//隐式转换成string
                };
            }
            sendMessageArray.push(message);
        }
        //添加消息框内容并显示
        let divSendingMessage = document.querySelector('.sending-message');
        divSendingMessage.innerHTML = '';
        let elementList = [];//用于更改‘发送状态’
        for (let i = 0; i < sendMessageArray.length; i++) {
            let divRow = document.createElement('div');
            divRow.className = 'row';
            divRow.innerHTML = `<div class="attach-name">${sendMessageArray[i].subject}</div>`;
            let divSending = document.createElement('div');
            divSending.className = 'sending';
            divSending.innerHTML = '已准备';
            divRow.appendChild(divSending);
            divSendingMessage.appendChild(divRow);
            elementList[i] = divSending;
        }
        document.querySelector('.message-container').style.display = 'block';
        /*         for (let i = 0; i < sendMessageArray.length; i++) {
                    elementList[i].innerHTML = '正在发送';
                    let res = await sendMailAsync(sendMessageArray[i]);
                    if (res === 'err') {
                        elementList[i].innerHTML = '失败';
                    } else {
                        elementList[i].innerHTML = '发送成功';
                    }
                } */
        //记录已经运行了几个发送邮件线程
        let threadingN = 0;
        //记录已使用的下标
        //let indexMessage=0;

        //sendingTask：用于setTimeout启动发送线程的函数,
        //index：发送信息数组的下标。
        setTimeout(async function sendingTask(index) {
            threadingN += 1;//线程数+1

            if (index < sendMessageArray.length && threadingN <= data.threading) {
                //如果未达到指定的线程数，2秒后接着启动另一个发送线程。
                let temIndex = index + 1;//临时记录已经被使用的下标。
                if (threadingN < data.threading) {
                    setTimeout(sendingTask, 2000, temIndex);
                }
                else {
                    temIndex -= 1;
                }

                elementList[index].innerHTML = '正在发送';
                let res = await sendMailAsync(sendMessageArray[index]);
                if (res === 'err') {
                    elementList[index].innerHTML = '失败';
                } else {
                    elementList[index].innerHTML = '发送成功';
                    threadingN -= 1;
                }

                //此线程完成后启动下一个线程
                //setTimeout(sendingTask, 0, temIndex + 1);
                sendingTask(temIndex + 1);
            }
            else {
                threadingN -= 1;
            }
        }, 0, 0);
    });
    //消息窗的关闭按钮
    document.getElementById("button-close").addEventListener('click', event => {
        document.querySelector('.message-container').style.display = 'none';
    })
    //自动扫描目录
    document.getElementById('scan').addEventListener('click', event => {
        let basepath = document.getElementById('path').value.replace(/\\/g, "/");
        let filePathArray = fs.readdirSync(basepath);
        if (filePathArray.length > 0) {
            let imgsString = '';
            let attachmentString = '';
            filePathArray.forEach(item => {
                let extensionName = item.substring(item.lastIndexOf('.'));
                if (extensionName == '.rar' || extensionName == '.zip' || extensionName == '.7z') {
                    attachmentString += `${item}\n`;
                } else {
                    imgsString += `${item}\n`;
                }
            });
            document.getElementById('imgs-list').value = imgsString;
            document.getElementById('attachments-list').value = attachmentString;
        }

    });
    //邮件消息格式
    let messageModel = {
        from: 'wsx1887@qq.com',
        to: 'wsx1887@qq.com',
        subject: '',
        html: '',
        attachments: [{}]
    };
    //封装发送邮件为promise
    async function sendMailAsync(message) {
        return new Promise((resolve, reject) => {
            transporter.sendMail(message, (err, info) => {
                if (err) { reject('err') }
                else { resolve(info) }
            })
        })
    }
})();
