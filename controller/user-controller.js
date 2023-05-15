
const uuid = require('uuid');
const jwt = require('jsonwebtoken');
const Applicant = require('../model/applicant/applicant-model');
const nodemailer = require('nodemailer');
const { nodeMailerEmail, nodeMailerPass, clientUrl, JWTSECRET } = require('../config/envs');
const Recruiter = require('../model/recruiter/recruiter-model');
const Application = require('../model/application/application-model');

const applicantAuth = async (req, res) => {
    const { email } = req.body
    const token = `${uuid.v4()}`;
    const applicantUser = await Applicant.findOne({ email })
    if (!applicantUser) {
        const newApplicant = new Applicant({ email, confirmationToken: token, ConfirmationTokenExpiration: new Date(Date.now() + 15 * 60 * 1000) });
        await newApplicant.save();
    }

    applicantUser.confirmationToken = `${token}`
    applicantUser.ConfirmationTokenExpiration = new Date(Date.now() + 15 * 60 * 1000)
    await applicantUser.save()
    const transporter = await nodemailer.createTransport({
        service: 'Mailcoat',
        host: 'smtp.mailcoat.com',
        port: 587,
        secure: false,

        logger: true,
        debug: true,
        ignoreTLS: true,
        tls: {
            rejectUnAuthorized: true
        },
        auth: {
            user: "rofajazu@mailgolem.com",
            pass: "ff6633753e23a6e22b86"
        },


    });

    const mailOptions = {
        from: 'rofajazu@mailgolem.com',
        to: req.body.email,
        subject: 'Login in to your mwu jobs account',
        html: `<p>Click on the following link to login: <a href="${clientUrl + "/prefrence?token=" + token}">CLick Here</a></p>`
    };

    await transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.status(500).send('An error occurred while sending the email');
        } else {
            console.log('Email sent: ' + info.response);
            res.status(200).send('An email has been sent with the login link');
        }
    });
}

const confirmApplicant = async (req, res) => {

    try {

        const applicantUser = await Applicant.findOne({ confirmationToken: req?.query?.token || "" });
        if (!applicantUser || applicantUser.ConfirmationTokenExpiration < Date.now()) {
            return res.status(400).send('Invalid or expired token');
        }
        applicantUser.isEmailConfirmed = true;
        applicantUser.confirmationToken = undefined;
        applicantUser.ConfirmationTokenExpiration = undefined;
        await applicantUser.save();

        const token = jwt.sign(
            { userId: applicantUser._id },
            JWTSECRET,
            { expiresIn: '48h' }
        );

        res.status(200).json({ token, message: 'Email confirmed' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error confirming email');
    }

}

const applicantDetails = async (req, res) => {
    const { user_name, user_skills, user_education, user_location, user_description } = req.body
    const applicantUser = req.applicant


    try {

        const applicant = await Applicant.findOne({ email: applicantUser.email })
        if (!applicant) {
            res.status(404).json("user does not exists")
        }

        if (user_name) {
            applicant.name = user_name
        }
        if (user_education) {
            applicant.education = user_education
        }
        if (user_location) {
            applicant.location = user_location
        }
        if (user_skills) {
            applicant.skills = user_skills
        }
        if (user_description) {
            applicant.description = user_description
        }

        await applicant.save()
        res.status(200).json("details updated")

    } catch (error) {
        console.log(error);
        res.status(500).json("something went wrong")
    }
}

const recruiterAuth = async (req, res) => {
    const { email } = req.body
    const token = `${uuid.v4()}`;
    const RecruiterUser = await Recruiter.findOne({ email })
    if (!RecruiterUser) {
        const newRecruiter = new Recruiter({ email, confirmationToken: token, ConfirmationTokenExpiration: new Date(Date.now() + 15 * 60 * 1000) });
        await newRecruiter.save();
    }

    RecruiterUser.confirmationToken = `${token}`
    RecruiterUser.ConfirmationTokenExpiration = new Date(Date.now() + 15 * 60 * 1000)
    await RecruiterUser.save()
    const transporter = await nodemailer.createTransport({
        service: 'Mailcoat',
        host: 'smtp.mailcoat.com',
        port: 587,
        secure: false,

        logger: true,
        debug: true,
        ignoreTLS: true,
        tls: {
            rejectUnAuthorized: true
        },
        auth: {
            user: "rofajazu@mailgolem.com",
            pass: "ff6633753e23a6e22b86"
        },


    });

    const mailOptions = {
        from: 'rofajazu@mailgolem.com',
        to: req.body.email,
        subject: 'Login in to your mwu jobs account',
        html: `<p>Click on the following link to login: <a href="${clientUrl + "/prefrence?token=" + token}">CLick Here</a></p>`
    };

    await transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.status(500).send('An error occurred while sending the email');
        } else {
            console.log('Email sent: ' + info.response);
            res.status(200).send('An email has been sent with the login link');
        }
    });
}



const confirmRecruiter = async (req, res) => {

    try {

        const RecruiterUser = await Recruiter.findOne({ confirmationToken: req?.query?.token || "" });
        if (!RecruiterUser || RecruiterUser.ConfirmationTokenExpiration < Date.now()) {
            return res.status(400).send('Invalid or expired token');
        }
        RecruiterUser.isEmailConfirmed = true;
        RecruiterUser.confirmationToken = undefined;
        RecruiterUser.ConfirmationTokenExpiration = undefined;
        await RecruiterUser.save();

        const token = jwt.sign(
            { userId: RecruiterUser._id },
            JWTSECRET,
            { expiresIn: '48h' }
        );

        res.status(200).json({ token, message: 'Email confirmed' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error confirming email');
    }

}





module.exports = { applicantAuth, confirmApplicant, applicantDetails, recruiterAuth, confirmRecruiter }