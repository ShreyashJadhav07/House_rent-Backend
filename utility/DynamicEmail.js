
const dotenv=require("dotenv");
const nodemailer=require("nodemailer");
dotenv.config();
const fs=require("fs");


async function updateTemplateHelper(templatePath, toReplaceObject) {
    let templateContent = await fs.promises.readFile(templatePath, "utf-8");
    const keyArrs = Object.keys(toReplaceObject);
    keyArrs.forEach((key) => {
        templateContent = templateContent.replace(`#{${key}}`, toReplaceObject[key]);
    })
    return templateContent;
}

async function emailSender(templatePath, recieverEmail, toReplaceObject) {
    try {
        const content = await updateTemplateHelper(templatePath, toReplaceObject);
        
        const sendGridDetails = {
            service:"gmail",
            port: 465,
            secure: true,
            auth: {
                user:"shreyashjadhav913@gmail.com",
                pass: process.env.APP_PASSWORD
            }
        }
        const msg = {
            to: recieverEmail,
            from: 'shreyashjadhav913@gmail.com', // Change to your verified sender
            subject: 'Sending First Email',
            text: "",
            html: content,
        }
        const transporter = nodemailer.createTransport(sendGridDetails);
        await transporter.sendMail(msg);
    } catch (err) {
        console.log("email not send because of the errro", err);
    }
}

module.exports = emailSender;