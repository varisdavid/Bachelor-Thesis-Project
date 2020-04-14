from flask import Blueprint, request, jsonify, Response, Flask, render_template, send_from_directory
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    JWTManager,
    jwt_required,
    create_access_token,
    get_jwt_identity,
)
import stripe
import json
import os

# You can import the database from a blueprint
from server.database import db, Employee, Company
from server import app

# random string
jwt = JWTManager(app)

# Creates the blueprint
bp = Blueprint("price", __name__, url_prefix="/price")


# Set your secret key. Remember to switch to your live secret key in production!
# See your keys here: https://dashboard.stripe.com/account/apikeys
stripe.api_key = "sk_test_MxfGoXSS0PlMgfeeqEYdfNk500ocPzvF2w"


@bp.route("/start", methods=["GET"])
def test():
    if request.method == "GET":
        stripe.api_key = "sk_test_MxfGoXSS0PlMgfeeqEYdfNk500ocPzvF2w"

        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            subscription_data={"items": [{"plan": "plan_123",}],},
            success_url="https://example.com/success?session_id={CHECKOUT_SESSION_ID}",
            cancel_url="https://example.com/cancel",
        )
        return True

# Setup Stripe python client library

@app.route('/setup', methods=['GET'])
def get_publishable_key():
    return jsonify({'publicKey': os.getenv('STRIPE_PUBLISHABLE_KEY'), 'basicPlan': os.getenv('BASIC_PLAN_ID'), 'proPlan': os.getenv('PRO_PLAN_ID')})

# Fetch the Checkout Session to display the JSON result on the success page
@app.route('/checkout-session', methods=['GET'])
def get_checkout_session():
    id = request.args.get('sessionId')
    checkout_session = stripe.checkout.Session.retrieve(id)
    return jsonify(checkout_session)


@app.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
    data = json.loads(request.data)
    domain_url = os.getenv('DOMAIN')

    try:
        # Create new Checkout Session for the order
        # Other optional params include:
        # [billing_address_collection] - to display billing address details on the page
        # [customer] - if you have an existing Stripe Customer ID
        # [customer_email] - lets you prefill the email input in the form
        # For full details see https:#stripe.com/docs/api/checkout/sessions/create

        # ?session_id={CHECKOUT_SESSION_ID} means the redirect will have the session ID set as a query param
        checkout_session = stripe.checkout.Session.create(
            success_url=domain_url +
            "/success.html?session_id={CHECKOUT_SESSION_ID}",
            cancel_url=domain_url + "/canceled.html",
            payment_method_types=["card"],
            subscription_data={"items": [{"plan": data['planId']}]}
        )
        return jsonify({'sessionId': checkout_session['id']})
    except Exception as e:
        return jsonify(error=str(e)), 403

