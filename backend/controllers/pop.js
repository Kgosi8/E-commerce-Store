const cloudinary = require('../config/cloudinary');
const Order = require('../model/Order');

// Upload proof of payment (POP) for an order

async function uploadPOP(req, res) {
  try {
    const {orderId} = req.params;

    //File check- multer puts it on req.file

    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'No file uploaded. Please attach a proof of payment.',
        });
    }

    // find the order by orderId

    const order = await Order.findOne({ orderId });

    if (!order) {
        return res.status(404).json({
            success: false,
            message: 'Order not found.',
        });
    }

    // Only EFT orders need a POP

    if (order.paymentMethod !== 'eft') {
        return res.status(400).json({
            success: false,
            message: 'Proof of payment is only required for EFT orders.',
        });
    }

    //Delete previous POP from Cloudinary if it exists

    if (order.popPublicId) {
        await cloudinary.uploader.destroy(order.popPublicId,{
            resource_type: req.file.mimetype==='application/pdf'?'raw':'image'
        });
    }

    // Upload the new POP to Cloudinary

    const result= await new Promise((resolve, reject) => {
        const stream= cloudinary.uploader.upload_stream(
            {
                folder:'orders/pop',
                public_id: `${orderId}-pop`,
                resource_type: req.file.mimetype==='application/pdf'?'raw':'image',
                overwrite: true,
                tags: [orderId, order.eftReference],

            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        stream.end(req.file.buffer);
    });

    //Save URl  and public_id to the order

    order.popImageUrl= result.secure_url;
    order.popPublicId= result.public_id;
    order.popUploadedAt= new Date();

    await order.save();

    const {sendPOPNotification}= require('../services/email');
    sendPOPNotification(order);

    res.status(200).json({
        success: true,
        popImageUrl: order.popImageUrl,
        uploadedAt: order.popUploadedAt,
        message: 'POP uploaded successfully.',
    });

} catch(err){
    console.error('[uploadPOP]', err);

    //Multer file size error handling

    if (err.code=== 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            success: false,
            message: 'File size exceeds the 5MB limit.',
        });
    }

    return res.status(500).json({
        success: false,
        message: console.error('[uploadPOP]') ? 'An error occurred while uploading the proof of payment.' : 'An unexpected error occurred.',
    });
  }
}


// ── DELETE /api/orders/:orderId/pop (admin) ──────────────────────
async function deletePOP(req, res) {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (!order.popPublicId) {
      return res.status(404).json({ success: false, message: 'No proof of payment on file.' });
    }

    await cloudinary.uploader.destroy(order.popPublicId, {
      resource_type: order.popImageUrl?.endsWith('.pdf') ? 'raw' : 'image',
    });

    order.popImageUrl   = null;
    order.popPublicId   = null;
    order.popUploadedAt = null;
    await order.save();

    return res.json({ success: true, message: 'Proof of payment removed.' });

  } catch (err) {
    console.error('[deletePOP]', err);
    return res.status(500).json({ success: false, message: 'Failed to delete file.' });
  }
}

module.exports = { uploadPOP, deletePOP };


